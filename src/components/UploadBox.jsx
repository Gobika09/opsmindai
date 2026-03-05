import React from "react";
import { useDropzone } from "react-dropzone";

const UploadBox = ({ onUpload }) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: ".pdf",
    multiple: false,
    onDrop: (files) => onUpload(files[0]),
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: "2px dashed #38bdf8",
        padding: "40px",
        textAlign: "center",
        borderRadius: "10px",
        cursor: "pointer",
        marginBottom: "30px",
      }}
    >
      <input {...getInputProps()} />
      <p>Drag & Drop a PDF here, or click to select</p>
    </div>
  );
};

export default UploadBox;