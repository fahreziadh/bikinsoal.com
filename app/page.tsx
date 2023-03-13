"use client"
import Navbar from '@/components/nav-bar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { mapel } from '@/lib/mapel';
import Image from 'next/image';
import React, { useRef, useState } from 'react'
import { SubjectChoice } from './subject';


interface IParams {
  subject: string;
  grade: string;
  total_option?: number;
}

const Page = () => {

  const [subject, setSubject] = useState<string>("");
  const [grade, setGrade] = useState<string>("3 SMA");
  const [totalOption, setTotalOption] = useState<number>(4);

  const [responseBuffer, setResponseBuffer] = useState<string>("");
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const soalRef = useRef<null | HTMLDivElement>(null);
  const scrollToBios = () => {
    if (soalRef.current !== null) {
      soalRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const onSubmit = async () => {
    await generate({ subject, grade, total_option: totalOption });
  }

  const reset = () => {
    setResponseBuffer("");
  }

  const generate = async ({ grade = "umum", subject, total_option = 4 }: IParams) => {
    setIsFetching(true);
    reset()
    const response = await fetch("/api/request-question-trial", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: subject,
        grade: grade,
        total_option: total_option,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;

    if (!data) {
      return;
    }

    const decoder = new TextDecoder();
    const reader = data.getReader();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      setResponseBuffer((prev) => prev + chunkValue);
    }
    scrollToBios();
    setIsFetching(false);
  };

  return (
    <div className='container sm:w-1/2'>
      <div className="flex flex-col items-center justify-center bg-[url('/bg-transparent.svg')] py-10">
        <Image
          src="/illustration.png"
          alt="illustration"
          width={100}
          height={100}
          quality={100}
        />
        <h1 className='mt-8 text-center text-[40px] font-bold leading-none text-[#1B1A1E] sm:text-[60px]'>Generate Soal Ujian di bantu AI</h1>
        <h2 className='mt-8'><span className='font-bold'>120</span> Soal sudah di generate </h2>
        <form className="mt-10 grid w-full gap-1.5">
          <Label htmlFor="message-2">Mata Pelajaran / Subject</Label>
          <SubjectChoice onChange={(value) => setSubject(value)} />
          <Button disabled={isFetching} className='mt-2' onClick={onSubmit} type="button">{isFetching ? "Sedang Menulis..." : "Generate Soal 📃"}</Button>
        </form>
      </div>
      <div className='flex w-full flex-col gap-7 py-8'>
        {responseBuffer.split("(q)").length > 1 && <div className='flex w-full flex-col text-center'>
          <h1 className='text-2xl font-bold text-[#1B1A1E]' ref={soalRef}>Soal yang sudah di generate</h1>
        </div>
        }
        {responseBuffer.split("(q)").map((question, index) => {
          if (index === 0) {
            return null;
          }
          return (
            <div key={index} className="flex w-full flex-col rounded-lg bg-white p-7 shadow-md">
              <div className='inline-flex gap-2'>
                <span className='flex aspect-square h-6 w-6 items-center justify-center rounded-full bg-black text-sm text-white'>{index}</span>
                <span className='font-bold'>{question.split("(to)")[0]}</span>
              </div>
              <div className='mt-4 flex flex-col gap-4 pl-7 text-sm'>
                {question.split("(a)")[0].split("(o)").map((option, index) => {
                  if (index === 0) {
                    return null;
                  }
                  return (
                    <div key={index}><span>{String.fromCharCode(96 + index).toUpperCase()}. </span>{option}</div>
                  )
                })}
                {question.split("(a)")[1] && <div className='mt-4'><span className='font-bold'>Jawaban : </span>{question.split("(a)")[1]}</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Page;