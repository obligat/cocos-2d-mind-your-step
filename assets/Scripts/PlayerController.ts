import {
  _decorator,
  Animation,
  Component,
  EventMouse,
  input,
  Input,
  Node,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;

// 添加一个放大比
export const BLOCK_SIZE = 40;

@ccclass("PlayerController")
export class PlayerController extends Component {
  @property(Animation)
  BodyAnim: Animation = null;

  private _startJump: boolean = false;
  private _jumpStep: number = 0;
  private _curJumpTime: number = 0;
  private _jumpTime: number = 0.1;
  private _curJumpSpeed: number = 0;
  private _curPos: Vec3 = new Vec3();
  private _deltaPos: Vec3 = new Vec3(0, 0, 0);
  private _targetPos: Vec3 = new Vec3();

  start() {
    // input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
  }

  // 动态开启和关闭角色对鼠标消息的监听
  setInputActive(active: boolean) {
    if (active) {
      input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    } else {
      input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }
  }

  reset() {
  }

  update(deltaTime: number) {
    if (this._startJump) {
      // 累计总的跳跃时间
      this._curJumpTime += deltaTime;

      // 当跳跃时间是否结束
      if (this._curJumpTime > this._jumpTime) {
        // end 强制位置到终点
        this.node.setPosition(this._targetPos);
        // 清理跳跃标记
        this._startJump = false;
      } else {
        // tween
        this.node.getPosition(this._curPos);
        // 每一帧根据速度和时间计算位移
        this._deltaPos.x = this._curJumpSpeed * deltaTime;
        // 应用这个位移
        Vec3.add(this._curPos, this._curPos, this._deltaPos);
        // 将位移设置给角色
        this.node.setPosition(this._curPos);
      }
    }
  }

  onMouseUp(event: EventMouse) {
    if (event.getButton() === 0) {
      this.jumpByStep(1);
    } else if (event.getButton() === 2) {
      this.jumpByStep(2);
    }
  }

  jumpByStep(step: number) {
    if (this._startJump) {
      return;
    }

    // 标记开始跳跃
    this._startJump = true;
    // 跳跃的步数 1 或 2
    this._jumpStep = step;
    // 重置开始跳跃的时间
    this._curJumpTime = 0;

    const clipName = step === 1 ? "oneStep" : "twoStep";

    const state = this.BodyAnim.getState(clipName);
    this._jumpTime = state.duration;

    // 根据时间计算出速度
    this._curJumpSpeed = (this._jumpStep * BLOCK_SIZE) / this._jumpTime;
    // 获取角色当前的位置
    this.node.getPosition(this._curPos);
    // 计算出目标位置
    Vec3.add(
      this._targetPos,
      this._curPos,
      new Vec3(this._jumpStep * BLOCK_SIZE, 0, 0)
    );

    if (this.BodyAnim) {
      if (step === 1) {
        this.BodyAnim.play("oneStep");
      } else if (step === 2) {
        this.BodyAnim.play("twoStep");
      }
    }
  }
}
