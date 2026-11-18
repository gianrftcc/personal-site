import { useEffect, useRef } from 'react';
import { mountScene } from './three/scene';

//import { initNoise } from './noise';

import manUrl from './assets/3d/human.glb?url';
import wolfUrl from './assets/3d/wolf.glb?url';
import wolfTexUrl from './assets/3d/wolf.jpg?url';

import './Main3d.css';

export default function Scene() {

  const canvas = useRef<HTMLCanvasElement>(null);
  const screen = useRef<HTMLElement>(null);
  const main = useRef<HTMLElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const bubble = useRef<HTMLDivElement>(null);

  useEffect(() => {

    const prevRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    //const noise = initNoise();
    //(window as any).__noise = noise.ready;

    const html = document.documentElement;
    const safety = window.setTimeout(() => html.classList.add('ready'), 3500); // se WebGL non parte
    let dispose: (() => void) | undefined;
    try {
      dispose = mountScene({
        canvas: canvas.current,
        screen: screen.current,
        main: main.current,
        hint: hint.current,
        bubble: bubble.current,
        models: { man: manUrl, wolf: wolfUrl, wolfTex: wolfTexUrl },
      });
    } catch (e) {
      console.error(e);
      html.classList.add('ready');
    }

    return () => {
      clearTimeout(safety);
      dispose?.();
      //noise.dispose();
      delete (window as any).__noise;
      history.scrollRestoration = prevRestoration;
    };
  }, []);

  return (
    <>
      <canvas ref={canvas} className="sc-canvas" />
      <div className="sc-noise" />
      <div className="sc-spacer" />

      <main ref={main} className="sc-main">
        <span className="sc-eyebrow"><i />Disponibile per nuovi progetti</span>
        <h1>Gianluca Raftacco</h1>
        <p>Full Stack Developer.</p>
      </main>

      <div ref={bubble} className="sc-bubble" role="status">ad ash non piace essere svegliato... tornerà..</div>
      <div ref={hint} className="sc-hint">scorri ↓</div>

      <section ref={screen} className="sc-screen" aria-label="Schermata del monitor">
        <div className="bar"><i /><i /><i /><span>~/gianluca</span></div>
        <div className="body">
          <p className="c">$ whoami</p>
          <h2>Gianluca Raftacco</h2>
          <p>
            FFull Stack Developer who likes building complex web stuff and making it work well.
            I’ve spent a lot of time on advanced Laravel + Vue + Tailwind projects, and I’m pretty comfortable with React, Next.js and shadcn/ui too.
            I also have solid experience with WordPress, the not-so-simple kind: custom plugins, bespoke themes built with Roots Sage, and sites with a lot of moving parts.
            These days I’m at Elsist, working on a web-based SCADA (a SaaS built with React, Next.js and Konva.js), plus a web portal with an e-commerce and a product activation system. I’m also following the development of new web pages to configure the product’s operating system through a Python API.
            Always up for a chat with people building interesting things on the web.
          </p>
          <p className="c">$ stack</p>
          <ul>
            <li>Laravel</li><li>Vue.js</li><li>Tailwind</li><li>React</li><li>shadcn/ui</li><li>Next.js</li>
          </ul>
          <p className="c">$ contatti</p>
					
          <p>
            <a href="mailto:gianluca.raftacco@gmail.com" target='_blank'>email</a>
          ·
            <a href="https://github.com/gianrftcc" target='_blank'>github</a>
          ·
            <a href="https://www.linkedin.com/in/gianlucaraftacco/" target='_blank'>linkedin</a>
          </p>
          
          <p className="c" style={{ fontSize: '.5em' }}>
            3D: “Walk Cycle” di <a href="https://sketchfab.com/3d-models/walk-cycle-05c7560e49c1441aa0c70d3dc7bc710b">skywarrior34niraj</a>, CC BY 4.0
            <br />
            3D: “Wolf” di <a href="https://sketchfab.com/3d-models/wolf-e319f122c2474d3186b841b019fb0edd">OLEKSO</a>, CC BY-NC 4.0
          </p>
        </div>
      </section>
    </>
  );
}