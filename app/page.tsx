"use client";
import { useState, useRef } from "react";
import axios from "axios";
import Head from "next/head";
import audiofile from "../public/audio/audio.mp3";
interface OutputComponentProps {
  output: string;
  heading: string;
}

interface RecordComponentProps {
  record: string;
  heading: string;
}

const OutputComponent: React.FC<OutputComponentProps> = ({
  output,
  heading,
}) => {
  return (
    <div className="bg-[#161c24] border border-[#45A29E] rounded-lg p-4 mt-4 lg:mt-0">
      <h2 className="text-lg font-bold text-[#66FCF1]">{heading}</h2>
      <pre className="whitespace-pre-wrap md:sm:text-base text-xs break-words text-[#C5C6C7]">
        {output}
      </pre>
    </div>
  );
};

const RecordComponent: React.FC<RecordComponentProps> = ({
  record,
  heading,
}) => {
  return (
    <div className="bg-[#161c24] border border-[#45A29E] rounded-lg p-4 mt-4">
      <h2 className="text-lg font-bold text-[#66FCF1]">{heading}</h2>
      <pre className="whitespace-pre-wrap md:sm:text-base text-xs break-words text-[#C5C6C7]">
        {record}
      </pre>
    </div>
  );
};

const Home = () => {
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [optabFile, setOptabFile] = useState<File | null>(null);
  const [inputContent, setInputContent] = useState<string>("");
  const [optabContent, setOptabContent] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [record, setRecord] = useState<string>("");
  const [intermediateFile, setIntermediateFile] = useState<string>("");
  const [symtabFile, setSymtabFile] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [warning, setWarning] = useState<string>("");

  const inputFileRef = useRef<HTMLInputElement>(null); // Ref for input file input
  const optabFileRef = useRef<HTMLInputElement>(null); // Ref for optab file input

  const [showPass1, setShowPass1] = useState(false); // Add a new state variable to track which pass to show

  const handleFileRead = (
    file: File,
    setContent: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === "string") {
        setContent(e.target.result);
      }
    };
    reader.readAsText(file);
  };

  const handleInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setInputFile(file);
    if (file) {
      handleFileRead(file, setInputContent);
    }
  };

  const handleOptabFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setOptabFile(file);
    if (file) {
      handleFileRead(file, setOptabContent);
    }
  };

  const handleInputContentChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => setInputContent(e.target.value);
  const handleOptabContentChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => setOptabContent(e.target.value);

  const loadPresetOptab = () => {
    const presetOptab = `ADD 18\nAND 40\nCOMP 28\nDIV 24\nJ 3C\nJEQ 30\nJGT 34\nJLT 38\nJSUB 48\nLDA 00\nLDCH 50\nLDL 08\nLDX 04\nMUL 20\nOR 44\nRD D8\nRSUB 4C\nSTA 0C\nSTCH 54\nSTL 14\nSTSW E8\nSTX 10\nSUB 1C\nTD E0\nTIX 2C\nWD DC`;
    setOptabContent(presetOptab);
    setOptabFile(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!inputContent || !optabContent) {
      setWarning(
        "Both input.txt and optab.txt contents are required before submission."
      );
      return;
    }

    const formData = new FormData();
    formData.append(
      "input_file",
      inputFile
        ? new File([inputContent], "input.txt")
        : new Blob([inputContent], { type: "text/plain" }),
      "input.txt"
    );
    formData.append(
      "optab_file",
      optabFile
        ? new File([optabContent], "optab.txt")
        : new Blob([optabContent], { type: "text/plain" }),
      "optab.txt"
    );

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/process-files/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setOutput(res.data.output_file || "No output received.");
      setRecord(res.data.record_file || "No record received.");
      setIntermediateFile(
        res.data.intermediate_file || "No intermediate file received."
      );
      setSymtabFile(res.data.symtab_file || "No symtab file received.");
      setError("");
      setWarning("");
    } catch (error) {
      setError("Error Occured During Fetch");
      setOutput("");
      setRecord("");
      setIntermediateFile("");
      setSymtabFile("");
    }
  };

  const handleClearForm = () => {
    setInputFile(null);
    setOptabFile(null);
    setInputContent("");
    setOptabContent("");
    setOutput("");
    setRecord("");
    setIntermediateFile("");
    setSymtabFile("");
    setError("");
    setWarning("");

    if (inputFileRef.current) {
      inputFileRef.current.value = ""; // Reset input file input
    }

    if (optabFileRef.current) {
      optabFileRef.current.value = ""; // Reset optab file input
    }
  };

  const handlePass1Click = () => {
    setShowPass1(true);
  };

  const handlePass2Click = () => {
    setShowPass1(false);
  };

  const audioRef = useRef<HTMLAudioElement>(null); // Ref for audio element

  const playAudio = () => {
    if (audioRef.current) {
      console.log("Playing audio...");
      audioRef.current.play(); // Play the audio
      console.log("Audio playing...");
    } else {
      console.log("Audio element not found...");
    }
  };

  return (
    <>
      <Head>
        <title>PASS-1 PASS-2 ASSEMBLER</title>
        <meta
          name="description"
          content="Upload and process input and optab files with ease"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen flex items-center overflow-hidden justify-center bg-gradient-to-br from-[#266c69] to-[#266c69] via-[#161c24]  py-8 px-4 lg:px-12">
        <div className="flex flex-col lg:flex-row w-full border-2 border-[#45A29E] lg:max-w-5xl bg-[#161c24] rounded-lg shadow-2xl shadow-[#66FCF1]">
          <div className="lg:w-1/2 p-6">
            <h1 className="text-2xl font-bold text-center text-[#66FCF1] mb-6 underline">
              PASS-1 PASS-2 ASSEMBLER
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-lg font-medium text-[#C5C6C7]">
                  Input File
                </label>
                <input
                  ref={inputFileRef}
                  type="file"
                  id="inputFile"
                  onChange={handleInputFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="inputFile"
                  className="mt-1 block w-full bg-[#58cdc5] text-[#0B0B10] py-1 px-2 rounded-md shadow hover:bg-[#45A29E]  cursor-pointer text-center"
                >
                  Choose File
                </label>

                <textarea
                  value={inputContent}
                  onChange={handleInputContentChange}
                  placeholder="Enter content for input.txt or edit uploaded file"
                  className="mt-2 w-full h-32 p-2 border-2 border-[#45A29E] rounded-md shadow-sm text-[#C5C6C7] bg-[#161c24] focus:outline-none"
                />
              </div>
              <hr className="h-px my-8 bg-gray-200 border-1 dark:bg-[#45A29E] border-[#45A29E]"></hr>
              <div>
                <label className="block text-lg font-medium text-[#C5C6C7] mt-5">
                  Optab File
                </label>
                <input
                  ref={optabFileRef}
                  type="file"
                  id="optabFile"
                  onChange={handleOptabFileChange}
                  className="hidden"
                />
                <div className="mt-1 flex space-x-2">
                  <label
                    htmlFor="optabFile"
                    className="w-full bg-[#58cdc5] text-[#0B0B10] py-1 px-2 rounded-md shadow hover:bg-[#45A29E] cursor-pointer text-center"
                  >
                    Choose Optab File
                  </label>
                  <button
                    type="button"
                    onClick={loadPresetOptab}
                    className="w-full bg-[#58cdc5] text-[#0B0B10] py-1 px-2 rounded-md shadow hover:bg-[#45A29E] focus:outline-none"
                  >
                    Load Preset Optab
                  </button>
                </div>
                <textarea
                  value={optabContent}
                  onChange={handleOptabContentChange}
                  placeholder="Enter content for optab.txt or edit uploaded file"
                  className="mt-2 w-full h-32 p-2 border-2 border-[#45A29E] rounded-md shadow-sm text-[#C5C6C7] bg-[#161c24] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#83f8f0] text-[#0B0B10] py-2 px-4 rounded-md shadow hover:bg-[#45A29E] focus:outline-none focus:ring-2 focus:ring-[#66FCF1] animate-pulse"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={handleClearForm}
                className="w-full mt-2 bg-red-500 text-white py-2 px-4 rounded-md shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Clear
              </button>
            </form>

            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4"
                role="alert"
              >
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}
          </div>

          <div className="lg:w-1/2 p-6 flex flex-col space-y-4">
            {warning && (
              <div
                className="bg-[#161c24] border-2 border-[#45A29E] text-yellow-200 px-4 py-3 rounded relative"
                role="alert"
              >
                <strong className="font-bold">Warning:</strong>
                <span className="block sm:inline"> {warning}</span>
              </div>
            )}
            {!output && !record && (
              <div className="bg-[#161c24] border-2 border-[#45A29E] rounded-lg p-4 text-[#C5C6C7] text-center py-72">
                <p className="text-lg text-[#c5c6c7d7] animate-bounce">
                  Upload files and submit the form to see the results here.
                </p>
              </div>
            )}
            {output && record && (
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handlePass1Click}
                  className="bg-[#66FCF1] text-[#0B0B10] py-1 px-2 rounded-md shadow hover:bg-[#45A29E] focus:outline-none"
                >
                  Pass 1 Result
                </button>
                <button
                  type="button"
                  onClick={handlePass2Click}
                  className="bg-[#66FCF1] text-[#0B0B10] py-1 px-2 rounded-md shadow hover:bg-[#45A29E] focus:outline-none"
                >
                  Pass 2 Result
                </button>
              </div>
            )}
            {showPass1 ? (
              <>
                {intermediateFile && (
                  <OutputComponent
                    output={intermediateFile}
                    heading="Intermediate File"
                  />
                )}
                {symtabFile && (
                  <RecordComponent record={symtabFile} heading="Symtab File" />
                )}
              </>
            ) : (
              <>
                {output && (
                  <OutputComponent output={output} heading="Final Output" />
                )}
                {record && (
                  <RecordComponent record={record} heading="Record File" />
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <audio ref={audioRef} src={audiofile} preload="auto" />

      <footer className="w-full bg-[#161c24] text-center py-4">
        <p className="text-[#C5C6C7]">
          &copy; 2024 JIMMY MATHEW. All rights reserved.
        </p>
        <button
          onClick={playAudio}
          className="mt-2 bg-[#58cdc5] text-[#0B0B10] py-1 px-4 rounded-md shadow hover:bg-[#45A29E] focus:outline-none"
        >
          Dont Press
        </button>
      </footer>
    </>
  );
};

export default Home;
