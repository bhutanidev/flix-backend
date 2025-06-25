# 🎬 Rotflix

A full-stack video streaming platform . Rotflix supports adaptive bitrate streaming using HLS, secure access via signed URLs and cookies, and fast video delivery through AWS CloudFront. Built with modern technologies like FFmpeg, Next.js, and Docker.

---

## 🚀 Live Frontend

- 🌐 [Rotflix Frontend](https://www.rotflix.xyz/)
- 📂 [Rotflix Frontend Repo](https://github.com/bhutanidev/flix-frontend)

---
## 📸 Example: Adaptive Streaming in Action

![Adaptive Streaming in Action](https://github.com/user-attachments/assets/6b490d69-2d86-40a8-bca0-098f6799116f)

*⬆️ The video player automatically switches to 360p segments instead of 720p when network speed drops, ensuring uninterrupted playback via HLS.*

## 🛠️ Tech Stack

### 🔹 Frontend
- **Next.js** (React Framework)
- **TypeScript**
- **Framer Motion** (animations)
- **Tailwind CSS**

### 🔹 Backend
- **Node.js**
- **Express.js**
- **FFmpeg** (video processing and HLS encoding)
- **MongoDB Atlas** (database)
- **AWS S3** (object storage)
- **AWS CloudFront** (CDN for secure & fast delivery)
- **AWS EC2** (Deployment)
- **Docker** (containerized deployment)

---

## 📦 Features

- 🎥 **Video Upload & Transcoding**  
  Upload a single video which gets transcoded into HLS format with multiple resolutions.

- 🌐 **Adaptive Streaming**  
  Quality automatically adjusts based on user bandwidth using HLS.

- 🔐 **Secure Playback**  
  Access control with **signed URLs** and **signed cookies** using AWS CloudFront.

- ☁️ **Cloud Storage**  
  Processed videos are uploaded to a private **S3** bucket and served via **CloudFront**.

- 📄 **Metadata Management**  
  Stores video metadata and manifest file URLs in **MongoDB**.

---




📜 License
MIT © Dev Bhutani

