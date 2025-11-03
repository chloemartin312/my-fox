/**
 * Copyright 2025 chloemartin312
 * @license Apache-2.0, see LICENSE for full text.
 */
import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";

/**
 * `my-fox`
 * 
 * @demo index.html
 * @element my-fox
 */
export class MyFox extends DDDSuper(I18NMixin(LitElement)) {

  static get tag() {
    return "my-fox";
  }

  constructor() {
    super();
    this.cards = Array.from({ length: 51 }, (_, i) => ({
      id: i + 1,
      imageUrl: "", 
      likes: 0,
      dislikes: 0,
      loaded: false,
    }));
    this.currentIndex = 0;
    this.copied = false;
  }

  // Lit reactive properties
  static get properties() {
    return {
      ...super.properties,
      cards: { type: Array },
      currentIndex: { type: Number },
      copied: { type: Boolean },
    };
  }

  // Lit scoped styles
  static get styles() {
    return [super.styles,
    css`
      :host {
        display: flex;
        justify-content: center;
        align-items: center;    
        background-color: var(--ddd-theme-default-shrineTan);
        font-family: var(--ddd-font-secondary);
        box-sizing: border-box;
        padding: 1rem;
      }

      button {
        margin: 1rem;
        padding: 0.5rem 1rem;
        font-size: 1rem;
        background-color: var(--ddd-theme-default-landgrantBrown);
        color: white;
        border: none;
        border-radius: 0.5rem;
      }

      img {
        width: 300px;
        height: 400px;
        margin: 0.5rem;
      }

      .card {
        width: 350px;
        height: 800px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;   
        border: 4px solid var(--ddd-theme-default-landgrantBrown);
        background-color: #FFC3CC;
        border-radius: 12px;
        padding: 1rem;
        color: var(--ddd-theme-default-landgrantBrown);
      }

      .actions {
        display: flex;
        align-items: center;
      }

      .share {
        display: flex;
        color: var(--ddd-theme-default-shrineTan);
        flex-direction: column;
        align-items: center;
      }

      .navigation {
        color: var(--ddd-theme-default-shrineTan);
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-bottom: 1rem;
      }
    `];
  }

  // Lit render the HTML
  render() {
    const card = this.cards[this.currentIndex];
    return html`
        <div class="card">
          <h3>Fox ${card.id}</h3>

          <div class="navigation">
            <button class="arrow" @click="${this.prevCard}" ?disabled="${this.currentIndex === 0}"><</button>
            <button class="arrow" @click="${this.nextCard}" ?disabled="${this.currentIndex === this.cards.length - 1}">></button>
          </div>

          ${card.imageUrl
            ? html`<img src="${card.imageUrl}" alt="Fox ${card.id}" />`
            : html`<div class="placeholder">Loading fox...</div>`}

          <div class="actions">
            <button class="like-btn" @click="${() => this.like(card.id)}">🩷</button>
            <span class="count">${card.likes}</span>
            <button class="dislike-btn" @click="${() => this.dislike(card.id)}">👎</button>
            <span class="count">${card.dislikes}</span>
          </div>

          <div class="share">
            <button @click="${() => this.copyShareLink(card.id)}">Copy Share Link</button>
            ${this.copied ? html`<div class="copied-msg">Link copied!</div>` : ""}
          </div>
        </div>`;
  }

   // Load JSON data from endpoint
  async loadData() {
    this.loading = true;
    try {
      // Fetch JSON and parse
      const response = await fetch(new URL('./photos.json', import.meta.url));
      if (!response.ok) {
        throw new Error(`Failed to fetch photos.json: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();

      // Support root array or an object
      // isArray returns (T/F). if true photos = data, else photos = data.photos (or empty array if undefined/null)
      const photos = Array.isArray(data) ? data : (data.photos || []);

      // Map JSON data into card objects
      this.cards = photos.map(photo => ({
        id: photo.id,
        title: photo.label,
        imageUrl: photo.url,
        likes: 0,
        dislikes: 0,
      }));

      // Load saved likes if they exist
      this.loadLikesFromStorage();
    } catch (err) {
      console.error('Failed to load JSON data', err);
    } finally {
      this.loading = false;
    }
  }

  // Save & load likes from localStorage
  saveLikesToStorage() {
    localStorage.setItem('foxLikes', JSON.stringify(this.cards));
  }

  loadLikesFromStorage() {
    const saved = localStorage.getItem('foxLikes');
    if (saved) {
      const savedData = JSON.parse(saved);

      // Match saved likes/dislikes to cards
      this.cards = this.cards.map(card => {
        const savedCard = savedData.find(s => s.id === card.id);
        return savedCard ? { ...card, ...savedCard } : card;
      });
    }
  }

  // Like & Dislike actions
  like(id) {
    this.cards = this.cards.map(c =>
      c.id === id ? { ...c, likes: c.likes + 1 } : c
    );
    this.saveLikesToStorage();
  }

  dislike(id) {
    this.cards = this.cards.map(c =>
      c.id === id ? { ...c, dislikes: c.dislikes + 1 } : c
    );
    this.saveLikesToStorage();
  }

  // Copy share link to clipboard
  async copyShareLink(id) {
    const url = `${window.location.origin}${window.location.pathname}?fox=${id}`;
    try {
      await navigator.clipboard.writeText(url);
      this.copied = true;
      setTimeout(() => (this.copied = false), 1500);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  }

  // Next & Previous actions
  nextCard() {
    this.currentIndex = (this.currentIndex + 1) % this.cards.length;
  }

  prevCard() {
    this.currentIndex =
      (this.currentIndex - 1 + this.cards.length) % this.cards.length;
  }

  // When the component is ready
  firstUpdated() {
    this.loadData();
  }

  /**
   * haxProperties integration via file reference
   */
  static get haxProperties() {
    return new URL(`./lib/${this.tag}.haxProperties.json`, import.meta.url)
      .href;
  }
}

globalThis.customElements.define(MyFox.tag, MyFox);