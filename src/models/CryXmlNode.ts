export class CryXmlNode {
  public NodeID: number;
  public NodeNameOffset: number;
  public ItemType: number;
  public AttributeCount: number;
  public ChildCount: number;
  public ParentNodeID: number;
  public FirstAttributeIndex: number;
  public FirstChildIndex: number;
  public Reserved: number;

  constructor() {
    this.NodeID = 0;
    this.NodeNameOffset = 0;
    this.ItemType = 0;
    this.AttributeCount = 0;
    this.ChildCount = 0;
    this.ParentNodeID = 0;
    this.FirstAttributeIndex = 0;
    this.FirstChildIndex = 0;
    this.Reserved = 0;
  }
}
