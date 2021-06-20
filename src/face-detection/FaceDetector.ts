import * as tf from "@tensorflow/tfjs-core"
import "@tensorflow/tfjs-backend-webgl"
import * as detector from "@tensorflow-models/face-landmarks-detection"
import { MediaPipeFaceMesh } from "@tensorflow-models/face-landmarks-detection/dist/mediapipe-facemesh"

export class FaceDetector {

  mlModel: MediaPipeFaceMesh | null = null

  async prepare() {
    await tf.setBackend("webgl")
    this.mlModel = await detector.load(detector.SupportedPackages.mediapipeFacemesh)
  }

  ready () {
    return this.mlModel !== null
  }

  async detect(video: HTMLVideoElement) {
    if (!this.mlModel) {
      throw new Error("model is not loaded yet.")
    }
    return await this.mlModel.estimateFaces({
      input: video
    })
  }
}