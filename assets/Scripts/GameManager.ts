import {
  _decorator,
  CCInteger,
  Component,
  instantiate,
  Node,
  Prefab,
} from "cc";
import { BLOCK_SIZE } from "./PlayerController";
const { ccclass, property } = _decorator;

// 地图类型
enum BlockType {
  // 坑 0
  BT_NONE,
  // 方块 1
  BT_STONE,
}

@ccclass("GameManager")
export class GameManager extends Component {
  @property({ type: Prefab })
  public boxPrefab: Prefab | null = null;

  @property({ type: CCInteger })
  public roadLength: number = 50;
  private _road: BlockType[] = [];

  start() {
    this.generateRoad();
  }

  update(deltaTime: number) {}

  generateRoad() {
    // 每次生成时，将上次的结果清除
    this.node.removeAllChildren();

    this._road = [];

    // startPos 第一个地块永远是方块，保证角色不会掉下去
    this._road.push(BlockType.BT_STONE);

    // 由于我们的角色可以选择跳 1或跳 2，因此坑最多不应连续超过 2 个，即如果前面一个地块是坑，那么接下来的地块必须是方块
    for (let i = 1; i < this.roadLength; i++) {
      if (this._road[i - 1] === BlockType.BT_NONE) {
        this._road.push(BlockType.BT_STONE);
      } else {
        // Math.random() => [0, 1) 
        // Math.random() * 2 => [0, 2)
        // Math.floor(Math.random() * 2) => 0 或 1
        this._road.push(Math.floor(Math.random() * 2));
      }
    }

    for (let j = 0; j < this._road.length; j++) {
      let block: Node | null = this.spawnBlockByType(this._road[j]);

      if (block) {
        this.node.addChild(block);
        // 设置节点的位置
        block.setPosition(j * BLOCK_SIZE, 0, 0);
      }
    }
  }

  spawnBlockByType(type: BlockType) {
    if (!this.boxPrefab) {
      return null;
    }

    let block: Node | null = null;
    switch (type) {
      case BlockType.BT_STONE:
        block = instantiate(this.boxPrefab);
        break;
    }

    return block;
  }
}
