import {
  _decorator,
  CCInteger,
  Component,
  instantiate,
  Label,
  Node,
  Prefab,
  Vec3,
} from "cc";
import { BLOCK_SIZE, PlayerController } from "./PlayerController";
const { ccclass, property } = _decorator;

// 游戏状态
enum GameState {
  // 初始化地图，将角色放回初始点，显示游戏 UI
  GS_INIT,
  GS_PLAYING,
  GS_END,
}

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

  // GS_INIT
  // 开始 UI
  @property({ type: Node })
  public startMenu: Node | null = null;

  // 角色控制器
  @property({ type: PlayerController })
  public playerCtrl: PlayerController | null = null;

  // 计步器
  @property({ type: Label })
  public stepsLabel: Label | null = null;

  start() {
    this.setCurState(GameState.GS_INIT);

    this.playerCtrl?.node.on("JumpEnd", this.onPlayerJumpEnd, this);
  }

  update(deltaTime: number) {}

  // 提供给外界控制游戏状态的方法
  setCurState(value: GameState) {
    switch (value) {
      case GameState.GS_INIT:
        this.init();
        break;
      case GameState.GS_PLAYING:
        this.playing();
        break;
      case GameState.GS_END:
        break;
    }
  }

  init() {
    // 显示菜单
    if (this.startMenu) {
      this.startMenu.active = true;
    }

    // 创建地图
    this.generateRoad();

    if (this.playerCtrl) {
      // 禁用角色输入
      this.playerCtrl.setInputActive(false);
      // 重置位置
      this.playerCtrl.node.setPosition(Vec3.ZERO);
      this.playerCtrl.reset();
    }
  }

  playing() {
    if (this.startMenu) {
      this.startMenu.active = false;
    }

    if (this.stepsLabel) {
      this.stepsLabel.string = "0";
    }

    // 直接设置 active 会开始监听鼠标事件，hack 延迟处理
    setTimeout(() => {
      if (this.playerCtrl) {
        this.playerCtrl.setInputActive(true);
      }
    }, 0.1);
  }

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

  onStartButtonClicked() {
    this.setCurState(GameState.GS_PLAYING);
  }

  onPlayerJumpEnd(moveIndex: number) {
    if (this.stepsLabel) {
      this.stepsLabel.string =
        "" + (moveIndex >= this.roadLength ? this.roadLength : moveIndex);
    }

    this.checkResult(moveIndex);
  }

  // 判断角色是否跳跃到坑或者跳完所有地砖
  checkResult(moveIndex: number) {
    if (moveIndex < this.roadLength) {
      // 跳到了空方块
      if (this._road[moveIndex] == BlockType.BT_NONE) {
        this.setCurState(GameState.GS_INIT);
      }

      // 跳过了最大长度
    } else {
      this.setCurState(GameState.GS_INIT);
    }
  }
}
