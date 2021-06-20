import { WebGLRenderer, OrthographicCamera, Scene, Mesh, DirectionalLight, MeshPhysicalMaterial } from "three"
import { FaceDetector } from "./face-detection/FaceDetector"
import { FaceGeometry } from "./face-detection/FaceGeometry"

declare global {
  interface HTMLCanvasElement {
    captureStream(frameRate?: number): MediaStream;
  }
}

/**
 * Filters video stream and add effects.
 */
export class VideoStreamFilter {

  video: HTMLMediaElement & HTMLVideoElement
  outputStream: MediaStream
  stream: MediaStream

  threeCanvas: HTMLCanvasElement
  threeRenderer: THREE.WebGLRenderer
  threeCamera: THREE.OrthographicCamera | null = null
  threeScene: THREE.Scene

  outputCanvas: HTMLCanvasElement

  faceDetector: FaceDetector = new FaceDetector()
  faceGeometry: FaceGeometry = new FaceGeometry()

  constructor(stream: MediaStream) {
    console.log("New Filter for stream", stream)
    this.stream = stream
    this.video = document.createElement("video")
    this.threeCanvas = document.createElement("canvas")
    this.outputCanvas = document.createElement("canvas")

    this.video.addEventListener("playing", () => {
      const w = this.video.videoWidth
      const h = this.video.videoHeight
      this.outputCanvas.width = w
      this.outputCanvas.height = h
      this.threeRenderer.setSize(w, h)
      this.faceGeometry.setFrameSize(w, h)
      this.threeCamera = new OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 1, 10000)
      this.threeCamera.lookAt(0, 0, 0)
      this.threeCamera.position.setZ(1000)
      this.update()
    })
    this.video.srcObject = stream
    this.video.autoplay = true
    this.outputStream = this.outputCanvas.captureStream()

    const threeRenderer = new WebGLRenderer({ alpha: true, canvas: this.threeCanvas });
    this.threeCanvas = threeRenderer.domElement
    threeRenderer.setPixelRatio(1)

    const scene = new Scene();
    const light = new DirectionalLight(0xffffff);
    light.position.set(1, 1, 1);
    scene.add(light);
    const material = new MeshPhysicalMaterial({ color: 0xffffff });
    this.threeRenderer = threeRenderer
    this.threeScene = scene
    scene.add(new Mesh(this.faceGeometry, material))

    this.faceDetector.prepare()
  }

  async update() {
    if (this.faceDetector.ready()) {
      const predictions = await this.faceDetector.detect(this.video)
      if (predictions.length > 0) {
        this.faceGeometry.update(predictions[0])
      }
    }
    this.threeRenderer.render(this.threeScene, this.threeCamera!)
    const ctx = this.outputCanvas.getContext("2d")
    ctx?.drawImage(this.video, 0, 0)
    ctx?.drawImage(this.threeCanvas, 0, 0) 
    requestAnimationFrame(() => this.update());
  }
}