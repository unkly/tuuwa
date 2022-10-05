import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import logo from './logo.svg'
import './App.css'
import Peer, { MediaConnection } from 'skyway-js'
import { KEY } from './env'

function App() {
  const peer = new Peer({ key: KEY })
  const myRef = useRef<HTMLVideoElement>(null)
  const userRef = useRef<HTMLVideoElement>(null)
  const [localStream, setLocalStream] = useState<MediaStream>()
  const [myId, setMyId] = useState<string>('')
  const [callId, setCallId] = useState<string>('')

  peer.on('open', () => {
    setMyId(peer.id)
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (myRef.current) {
          myRef.current.srcObject = stream
          myRef.current.play().catch((e) => console.log(e))
          setLocalStream(stream)
        }
      })
      .catch((e) => {
        console.log(e)
      })
  })

  peer.on('call', (mediaConnection) => {
    if (myRef.current?.srcObject) {
      mediaConnection.answer(myRef.current.srcObject as MediaStream)

      mediaConnection.on('stream', async (stream) => {
        if (userRef.current) {
          userRef.current.srcObject = stream
          await userRef.current.play().catch(console.log)
        }
      })
    }
  })

  const start = () => {
    if (!myRef.current?.srcObject) return
    const mediaConnection = peer.call(callId, localStream)
    setEventListener(mediaConnection)
  }

  const setEventListener = (mediaConnection: MediaConnection) => {
    mediaConnection.on('stream', (stream: MediaStream) => {
      const videoElm = userRef.current
      if (videoElm) {
        videoElm.srcObject = stream
        videoElm.play()
      }
    })
  }

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCallId(e.target.value)
  }

  return (
    <div className='App'>
      <h1>通話アプリ</h1>
      <video
        ref={myRef}
        id='my-video'
        width='400px'
        autoPlay
        muted
        playsInline
      ></video>
      <p>{myId}</p>
      <textarea value={callId} onChange={onChange}></textarea>
      <button onClick={start}>通話開始</button>
      <video ref={userRef} width='400px' autoPlay muted playsInline></video>
    </div>
  )
}

export default App
