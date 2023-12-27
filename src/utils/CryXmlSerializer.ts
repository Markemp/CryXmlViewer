import * as fs from "fs";
import { parseStringPromise } from "xml2js";
import { CryXmlNode } from "../models/CryXmlNode";
import { CryXmlReference } from "../models/CryXmlReference";
import { CryXmlValue } from "../models/CryXmlValue";
import { CryXmlHeaderInfo } from "../models/CryXmlHeaderInfo";
import { SimpleXmlElement } from "../models/SimpleXmlElement";

interface Element {
  name: string;
  attributes: { [key: string]: string };
  children: any[];
}

export class CryXmlSerializer {
  private static PbxmlMagic = Buffer.from("pbxml\0", "utf8");
  private static CryXmlMagic = Buffer.from("CryXmlB\0", "utf8");

  public static async readFile(
    inFile: string,
    writeLog: boolean = false
  ): Promise<any> {
    try {
      const data = await fs.promises.readFile(inFile);
      return this.processData(data, writeLog);
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`Error reading file: ${e.message}`);
      } else {
        throw new Error("Error reading file: An unknown error occurred");
      }
    }
  }

  private static async processData(
    data: Buffer,
    writeLog: boolean
  ): Promise<string> {
    const maxMagicLength = Math.max(
      this.PbxmlMagic.length,
      this.CryXmlMagic.length
    );
    const peek = data.subarray(0, maxMagicLength);

    if (peek.equals(this.PbxmlMagic)) {
      return await this.loadPbxmlFile(data);
    } else if (peek.equals(this.CryXmlMagic)) {
      return await this.loadCryXmlBFile(data);
    } else {
      return parseStringPromise(data.toString());
    }
  }

  public static async loadCryXmlBFile(buffer: Buffer): Promise<string> {
    const headerInfo = await this.readCryXmlHeaderInfo(buffer);
    const nodeTable = await this.buildCryXmlNodeTable(buffer, headerInfo);
    const attributeTable = await this.buildCryXmlAttributeTable(
      buffer,
      headerInfo
    );
    const orderTable = await this.buildCryXmlOrderTable(buffer, headerInfo);
    const dataTable = await this.buildCryXmlDataTable(buffer, headerInfo);

    const xmlMap: { [nodeId: number]: SimpleXmlElement } = {};
    let attributeIndex = 0;
    let bugged = false;

    for (const node of nodeTable) {
      const nodeName = dataTable[node.NodeNameOffset] || "unknown";
      const element = new SimpleXmlElement(nodeName);

      for (let i = 0; i < node.AttributeCount; i++) {
        const attribute = attributeTable[attributeIndex++];
        const attrName = dataTable[attribute.NameOffset] || "";
        const attrValue = dataTable[attribute.ValueOffset] || "BUGGED";
        bugged = bugged || attrValue === "BUGGED";
        element.attributes[attrName] = attrValue;
      }

      xmlMap[node.NodeID] = element;
      if (node.ParentNodeID >= 0 && xmlMap[node.ParentNodeID]) {
        xmlMap[node.ParentNodeID].children.push(element);
      }
    }

    const xmlRoot = xmlMap[0];
    console.log(xmlRoot?.toXmlString());
    return xmlRoot?.toXmlString() || "";
  }

  public static async loadPbxmlFile(buffer: Buffer): Promise<string> {
    let offset = this.PbxmlMagic.length;

    const doc = await this.createNewElement(buffer, offset);
    return doc;
  }

  private static async createNewElement(
    buffer: Buffer,
    offset: number
  ): Promise<any> {
    const numberOfChildren = readCryInt(buffer, offset);
    offset += 4; // Size of integer

    const numberOfAttributes = readCryInt(buffer, offset);
    offset += 4; // Size of integer

    let nodeName, nodeNameLength;
    [nodeName, nodeNameLength] = readCString(buffer, offset);
    offset += nodeNameLength;

    let element: Element = { name: nodeName, attributes: {}, children: [] };

    for (let i = 0; i < numberOfAttributes; i++) {
      let key, keyLength, value, valueLength;
      [key, keyLength] = readCString(buffer, offset);
      offset += keyLength;
      [value, valueLength] = readCString(buffer, offset);
      offset += valueLength;

      element.attributes[key] = value;
    }

    let nodeText, nodeTextLength;
    [nodeText, nodeTextLength] = readCString(buffer, offset);
    offset += nodeTextLength;
    if (nodeText !== "") {
      element.children.push(nodeText);
    }

    for (let i = 0; i < numberOfChildren; i++) {
      const expectedLength = readCryInt(buffer, offset);
      offset += 4; // Size of integer
      const expectedPosition = offset + expectedLength;

      let childElement;
      [childElement, offset] = await this.createNewElement(buffer, offset);
      element.children.push(childElement);

      // Validation logic as per your C# code
      if (offset !== expectedPosition) {
        throw new Error("Expected length does not match.");
      }
    }

    return [element, offset];
  }

  private static async readCryXmlHeaderInfo(
    buffer: Buffer
  ): Promise<CryXmlHeaderInfo> {
    let offset = this.CryXmlMagic.length;
    const headerInfo = new CryXmlHeaderInfo();

    headerInfo.FileLength = buffer.readInt32LE(offset);
    offset += 4;
    headerInfo.NodeTableOffset = buffer.readInt32LE(offset);
    offset += 4;
    headerInfo.NodeTableCount = buffer.readInt32LE(offset);
    offset += 4;
    headerInfo.ReferenceTableOffset = buffer.readInt32LE(offset);
    offset += 4;
    headerInfo.ReferenceTableCount = buffer.readInt32LE(offset);
    offset += 4;
    headerInfo.OrderTableOffset = buffer.readInt32LE(offset);
    offset += 4;
    headerInfo.OrderTableCount = buffer.readInt32LE(offset);
    offset += 4;
    headerInfo.ContentOffset = buffer.readInt32LE(offset);
    offset += 4;
    headerInfo.ContentLength = buffer.readInt32LE(offset);
    offset += 4;

    return headerInfo;
  }

  private static async buildCryXmlNodeTable(
    buffer: Buffer,
    headerInfo: CryXmlHeaderInfo
  ): Promise<CryXmlNode[]> {
    let offset = headerInfo.NodeTableOffset;
    const nodeTable: CryXmlNode[] = [];
    let nodeID = 0;

    while (
      offset <
      headerInfo.NodeTableOffset +
        headerInfo.NodeTableCount * headerInfo.NodeTableSize
    ) {
      const node = new CryXmlNode();
      node.NodeID = nodeID++;
      node.NodeNameOffset = buffer.readInt32LE(offset);
      offset += 4;
      node.ItemType = buffer.readInt32LE(offset);
      offset += 4;
      node.AttributeCount = buffer.readInt16LE(offset);
      offset += 2;
      node.ChildCount = buffer.readInt16LE(offset);
      offset += 2;
      node.ParentNodeID = buffer.readInt32LE(offset);
      offset += 4;
      node.FirstAttributeIndex = buffer.readInt32LE(offset);
      offset += 4;
      node.FirstChildIndex = buffer.readInt32LE(offset);
      offset += 4;
      node.Reserved = buffer.readInt32LE(offset);
      offset += 4;

      nodeTable.push(node);
    }

    return nodeTable;
  }

  private static async buildCryXmlAttributeTable(
    buffer: Buffer,
    headerInfo: CryXmlHeaderInfo
  ): Promise<CryXmlReference[]> {
    let offset = headerInfo.ReferenceTableOffset;
    const attributeTable: CryXmlReference[] = [];

    while (
      offset <
      headerInfo.ReferenceTableOffset +
        headerInfo.ReferenceTableCount * headerInfo.ReferenceTableSize
    ) {
      const attribute = new CryXmlReference();
      attribute.NameOffset = buffer.readInt32LE(offset);
      offset += 4;
      attribute.ValueOffset = buffer.readInt32LE(offset);
      offset += 4;

      attributeTable.push(attribute);
    }

    return attributeTable;
  }

  private static async buildCryXmlOrderTable(
    buffer: Buffer,
    headerInfo: CryXmlHeaderInfo
  ): Promise<number[]> {
    let offset = headerInfo.OrderTableOffset;
    const orderTable: number[] = [];

    while (
      offset <
      headerInfo.OrderTableOffset +
        headerInfo.OrderTableCount * headerInfo.OrderTableSize
    ) {
      const value = buffer.readInt32LE(offset);
      offset += 4;
      orderTable.push(value);
    }

    return orderTable;
  }

  private static async buildCryXmlDataTable(
    buffer: Buffer,
    headerInfo: CryXmlHeaderInfo
  ): Promise<{ [key: number]: string }> {
    let offset = headerInfo.ContentOffset;
    const dataTable: CryXmlValue[] = [];

    while (offset < buffer.length) {
      const position = offset;
      const cryXmlValue = new CryXmlValue();
      cryXmlValue.Offset = position - headerInfo.ContentOffset;

      let value, valueLength;
      [value, valueLength] = readCString(buffer, offset);
      offset += valueLength;

      cryXmlValue.Value = value;
      dataTable.push(cryXmlValue);
    }

    // Converting the list to a dictionary-like object
    const dataMap: { [key: number]: string } = {};
    dataTable.forEach((item) => {
      dataMap[item.Offset] = item.Value;
    });

    return dataMap;
  }
}

function readCryInt(buffer: Buffer, offset: number): number {
  // Assuming the integer is in little-endian format. Use readInt32BE for big-endian.
  return buffer.readInt32LE(offset);
}

function readCString(buffer: Buffer, offset: number): [string, number] {
  let end = offset;

  while (buffer[end] !== 0x00 && end < buffer.length) {
    end++;
  }

  const str = buffer.toString("utf8", offset, end);

  return [str, end - offset + 1];
}
