export class CryXmlHeaderInfo {
  public FileLength: number;
  public NodeTableOffset: number;
  public NodeTableCount: number;
  public NodeTableSize: number = 28;
  public ReferenceTableOffset: number;
  public ReferenceTableCount: number;
  public ReferenceTableSize: number = 8;
  public OrderTableOffset: number;
  public OrderTableCount: number;
  public OrderTableSize: number = 4;
  public ContentOffset: number;
  public ContentLength: number;

  constructor() {
    this.FileLength = 0;
    this.NodeTableOffset = 0;
    this.NodeTableCount = 0;
    this.ReferenceTableOffset = 0;
    this.ReferenceTableCount = 0;
    this.OrderTableOffset = 0;
    this.OrderTableCount = 0;
    this.ContentOffset = 0;
    this.ContentLength = 0;
  }
}
