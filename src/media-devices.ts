import { VideoStreamFilter } from "./VideoStreamFilter"

export function addVirtualCamera() {

  const enumerateDevicesFn = MediaDevices.prototype.enumerateDevices;
  const getUserMediaFn = MediaDevices.prototype.getUserMedia;

  MediaDevices.prototype.enumerateDevices = async function () {
    const mediaInfoArray = await enumerateDevicesFn.call(navigator.mediaDevices)
    mediaInfoArray.push({
      deviceId: "virtual",
      groupId: "uh",
      kind: "videoinput",
      label: "Virtual Chrome Webcam",
    } as any)
    return mediaInfoArray
  }

  MediaDevices.prototype.getUserMedia = async function () {
    const args = arguments;
    if (args.length && args[0].video && args[0].video.deviceId) {
      if (
        args[0].video.deviceId === "virtual" ||
        args[0].video.deviceId.exact === "virtual"
      ) {
        // This constraints could mimick closely the request.
        // Also, there could be a preferred webcam on the options.
        // Right now it defaults to the predefined input.
        const constraints = {
          video: {
            facingMode: args[0].facingMode,
            advanced: args[0].video.advanced,
            width: args[0].video.width,
            height: args[0].video.height,
          },
          audio: false,
        };
        const stream = await getUserMediaFn.call(
          navigator.mediaDevices,
          constraints
        );
        if (stream) {
          const filter = new VideoStreamFilter(stream)
          return filter.outputStream;
        }
      }
    }
    const res = await getUserMediaFn.call(navigator.mediaDevices, ...arguments)
    return res;
  }

  console.log('VIRTUAL WEBCAM INSTALLED.')
}