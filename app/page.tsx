"use client";

import { FormEvent, useState } from "react";

type Status = { kind: "success" | "error"; message: string } | null;

export default function Home() {
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus(null);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), name: form.get("name") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message ?? "Nu am putut salva înscrierea.");
      setStatus({ kind: "success", message: "Ești pe listă! Mulțumim că te-ai alăturat comunității." });
      event.currentTarget.reset();
    } catch (error) {
      setStatus({ kind: "error", message: error instanceof Error ? error.message : "A apărut o eroare." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page-shell">
      <nav className="topbar"><a className="brand" href="#top"><span className="brand-mark">s</span> sendtim <span className="brand-divider">/</span> demo</a><span className="nav-note">Next.js · REST API</span></nav>
      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span className="live-dot" /> EXEMPLU PENTRU COMUNITATE</p>
          <h1>O comunitate bună începe cu <span>o conversație.</span></h1>
          <p className="intro">Un demo mic: un formular Next.js trimite datele pe server, iar serverul sincronizează contactul cu Sendtim.</p>
          <div className="flow"><span>Formular</span><i>→</i><span>Route Handler</span><i>→</i><span>Sendtim API</span></div>
          <p className="security-note"><span>⌑</span> Cheia API rămâne pe server. Nu ajunge niciodată în browser.</p>
        </div>
        <div className="form-card">
          <div className="card-top"><div><p className="card-kicker">NEWSLETTER COMUNITATE</p><h2>Rămânem aproape?</h2></div><span className="card-icon">✳</span></div>
          <p className="card-description">Noutăți, idei și invitații la următoarele întâlniri. Fără zgomot.</p>
          <form onSubmit={submit}>
            <label htmlFor="name">Prenume <span>(opțional)</span></label>
            <input id="name" name="name" placeholder="Alex" autoComplete="given-name" maxLength={80} />
            <label htmlFor="email">Adresa de email</label>
            <input id="email" name="email" type="email" placeholder="alex@exemplu.ro" autoComplete="email" required />
            <button type="submit" disabled={busy}>{busy ? "Se trimite…" : "Alătură-te comunității"}<span>→</span></button>
          </form>
          {status && <p className={`status ${status.kind}`} role="status">{status.message}</p>}
          <p className="privacy">Prin înscriere, ești de acord să primești emailuri de la comunitate. Te poți dezabona oricând.</p>
        </div>
      </section>
      <footer><span>Demo educațional · <a href="https://sendtim.com/docs" target="_blank" rel="noreferrer">Documentația Sendtim ↗</a></span><span>Construim comunități, un email pe rând.</span></footer>
    </main>
  );
}
