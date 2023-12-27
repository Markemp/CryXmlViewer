export class SimpleXmlElement {
  tagName: string;
  attributes: { [key: string]: string };
  children: SimpleXmlElement[];

  constructor(tagName: string) {
    this.tagName = tagName;
    this.attributes = {};
    this.children = [];
  }

  // Method to convert element to XML string
  toXmlString(): string {
    const attrs = Object.entries(this.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");
    const openTag = `<${this.tagName}${attrs ? " " + attrs : ""}>`;
    const closeTag = `</${this.tagName}>`;
    const childrenString = this.children
      .map((child) => child.toXmlString())
      .join("");
    return `${openTag}${childrenString}${closeTag}`;
  }
}
