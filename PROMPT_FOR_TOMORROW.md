# Prompt untuk Melanjutkan Development Besok

## 🚀 Prompt Utama (Copy ini besok)

```
Halo! Saya lanjutkan project CV AI Evaluator dari kemarin.

Tolong baca file PROGRESS.md untuk memahami context lengkap project ini,
lalu beritahu saya:
1. Apa yang sudah selesai
2. Apa yang sedang dikerjakan (in progress)
3. Apa langkah selanjutnya yang harus dilakukan (prioritas)

Setelah itu kita lanjutkan development dari situ.
```

---

## 📋 Prompt Alternatif (Tergantung Situasi)

### Jika Ingin Langsung Lanjut Coding
```
Baca PROGRESS.md dan lanjutkan development dari bagian yang "in progress"
```

### Jika Lupa Sudah Sampai Mana
```
Baca PROGRESS.md dan jelaskan dengan ringkas:
- Apa yang sudah dikerjakan kemarin
- File-file apa saja yang sudah dibuat
- Apa yang belum selesai
```

### Jika Ada Error atau Masalah
```
Baca PROGRESS.md untuk context project.

Ada error/masalah di [sebutkan file/bagian], tolong bantu fix:
[paste error message atau jelaskan masalahnya]
```

### Jika Mau Review Code
```
Baca PROGRESS.md untuk context.

Tolong review code yang sudah dibuat kemarin di folder [sebutkan folder]:
- Apakah ada yang perlu diperbaiki?
- Apakah sudah sesuai best practice?
- Ada saran improvement?
```

### Jika Mau Lanjut Task Spesifik
```
Baca PROGRESS.md untuk context.

Sekarang saya mau lanjutkan task: [nama task dari pending list]
Tolong guide step-by-step.
```

---

## 🎯 Quick Commands (Copy Paste)

### Lihat Git Log
```bash
git log --oneline --graph -10
```

### Check Current Branch
```bash
git status
```

### Run Development Server
```bash
npm run dev
```

### Check TypeScript Errors
```bash
npx tsc --noEmit
```

### View Prisma Studio
```bash
npm run prisma:studio
```

---

## 📝 Context Files untuk Dibaca Claude

Jika Claude perlu lebih banyak context, minta baca file-file ini:

1. **PROGRESS.md** - Overall progress tracking
2. **docs/ARCHITECTURE.md** - System architecture
3. **docs/TECH_STACK.md** - Technology decisions
4. **docs/FOLDER_STRUCTURE.md** - Project structure explanation
5. **prisma/schema.prisma** - Database schema
6. **src/app.ts** - Express app configuration
7. **src/server.ts** - Server startup
8. **package.json** - Dependencies & scripts

### Prompt untuk Minta Baca Multiple Files:
```
Baca file-file ini untuk full context:
1. PROGRESS.md
2. docs/ARCHITECTURE.md
3. prisma/schema.prisma

Lalu lanjutkan development dari situ.
```

---

## 🔧 Troubleshooting Prompts

### Jika Claude Bingung/Kehilangan Context
```
Reset context: Baca PROGRESS.md dari awal dan mulai fresh.

Project ini adalah: CV AI Evaluator - backend service untuk
mengevaluasi CV dan project report menggunakan AI/LLM.

Tech stack:
- Backend: Express.js + TypeScript
- Database: SQLite + Prisma
- Vector DB: LanceDB
- Job Queue: BullMQ + Redis
- LLM: Google Gemini API

Sudah selesai: [lihat PROGRESS.md completed section]
Belum selesai: [lihat PROGRESS.md pending section]

Lanjutkan dari sini.
```

### Jika Perlu Recap Cepat
```
Quick recap: Apa saja yang sudah dibuat kemarin?
List file-file utama yang sudah ada.
```

---

## ⚡ Pro Tips

### 1. Selalu Update PROGRESS.md
Setiap kali selesai task besar, update PROGRESS.md:
```
Update PROGRESS.md:
- Pindahkan [nama task] dari pending ke completed
- Tambahkan notes jika ada keputusan penting
```

### 2. Commit Sering
Commit setiap progress kecil dengan message yang jelas:
```bash
git add .
git commit -m "feat: add [apa yang dibuat]"
```

### 3. Jika Stuck
```
Saya stuck di [bagian apa].

Context:
- Sedang mengerjakan: [task]
- File yang sedang dibuat: [nama file]
- Error/masalah: [jelaskan]

Tolong bantu troubleshoot step-by-step.
```

### 4. Jika Mau Code Review
```
Sebelum lanjut, tolong review semua code yang sudah dibuat:
- Apakah ada code smell?
- Apakah TypeScript types sudah benar?
- Apakah error handling sudah proper?
- Apakah sesuai dengan architecture di docs/ARCHITECTURE.md?
```

---

## 🎯 Daily Workflow (Recommended)

### Pagi (Start Session)
1. Buka terminal di project folder
2. Run: `git status` - cek current state
3. Baca PROGRESS.md sendiri (opsional)
4. **Paste prompt utama di atas ke Claude**
5. Dengarkan summary dari Claude
6. Lanjut coding!

### Siang/Sore (Progress Check)
```
Recap progress hari ini:
- Apa saja yang sudah selesai sejak tadi pagi?
- Apa yang sedang dikerjakan sekarang?
- Berapa % completion project?
```

### Malam (End Session)
```
Sebelum selesai:
1. Update PROGRESS.md dengan progress hari ini
2. Commit semua changes
3. Buat summary: apa yang sudah dikerjakan hari ini
```

---

## 📊 Progress Tracking

### Cek Overall Progress
```
Berapa persen project ini sudah selesai?
List:
- Completed tasks (✅)
- In progress tasks (🔄)
- Pending tasks (📋)
```

### Estimasi Waktu
```
Berdasarkan PROGRESS.md, estimasi berapa lama lagi
untuk menyelesaikan project ini?
```

---

## 💾 Backup Reminder

Jangan lupa push ke GitHub secara berkala:
```bash
git push origin main
```

---

**Good luck with development tomorrow! 🚀**

**Remember:** PROGRESS.md adalah "memory" kita.
Selalu update dan selalu minta Claude baca file itu di awal session!
