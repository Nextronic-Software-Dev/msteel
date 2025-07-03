import React, { useState } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "./utils/cropImage";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";

const CropEasy = ({
  photoURL,
  setOpenCrop,
  setPhotoURL,
  setFile,
  save,
}: any) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<any>(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const cropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const cropImage = async () => {
    try {
      const { file, url }: any = await getCroppedImg(
        photoURL,
        croppedAreaPixels,
        rotation
      );
      setPhotoURL(url);
      setFile(file);
      save(false);
      // setOpenCrop(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className=" flex flex-col">
      <div
        className=""
        style={{
          background: "#333",
          position: "relative",
          height: 500,
          width: 500,
          //   minWidth: { sm: 500 },
        }}
      >
        <Cropper
          image={photoURL}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={1}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropChange={setCrop}
          onCropComplete={cropComplete}
        />
      </div>
      <div className="flex flex-col mx-1 my-1">
        <div className="w-full mb-1">
          <div>
            <span>Zoom: {zoom}</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => {
                setZoom(e.target.value);
              }}
              className="w-full"
            />
            {/* <Slider
              //   valueLabelDisplay="auto"
              //   valueLabelFormat={zoomPercent}
              min={1}
              max={3}
              step={0.1}
              value={[zoom]}
              onChange={(e: any) => {
                console.log("zz", e);

                // setZoom(e);
              }}
            /> */}
          </div>
          <div>
            <span>Rotation: {rotation + "°"}</span>
            <input
              type="range"
              value={rotation}
              min={0}
              max={360}
              aria-labelledby="Rotate"
              onChange={(e: any) => {
                setRotation(e.target.value);
              }}
              className="w-full"
            />
            {/* <Slider
              //   valueLabelDisplay="auto"
              min={0}
              max={360}
              value={[rotation]}
              onChange={(rotation: any) => setZoom(rotation)}
            /> */}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="default"
            // startIcon={<CropIcon />}
            onClick={cropImage}
          >
            Crop
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CropEasy;

const zoomPercent = (value: any) => {
  return `${Math.round(value * 100)}%`;
};
