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
        display: block;
        text-align: center;
        background-color: var(--ddd-theme-default-shrineTan);
        font-family: var(--ddd-font-secondary);
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
        margin: 1rem;
      }

      .card {
        width: 350px;
        height: 800px;
        border: 4px solid var(--ddd-theme-default-landgrantBrown);
        border-radius: 12px;
        padding: 1rem;
      }
    `];
  }

  // Lit render the HTML
  render() {
    const card = this.cards[this.currentIndex];
    return html`
        <div class="card">
          <h3>Fox ${card.id}</h3>

          <button class="arrow" @click="${this.prevCard}" ?disabled="${this.currentIndex === 0}"><</button>
          <button class="arrow" @click="${this.nextCard}" ?disabled="${this.currentIndex === this.cards.length - 1}">></button>

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
            <button @click="${() => this.share(card.id)}">Copy Share Link</button>
            ${this.copied ? html`<div class="copied-msg">Link copied!</div>` : ""}
          </div>
        </div>`;
  }

   // Load JSON data from endpoint
  async loadData() {
    this.loading = true;
    try {
      const response = await fetch('photos.json');
      const data = await response.json();

      // Map JSON into card objects
      this.cards = data.photos.map(photo => ({
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

  // Save and load likes from localStorage
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

  // Share action (copy link)
  share(id) {
    const card = this.cards.find(c => c.id === id);
    if (card) {
      navigator.clipboard.writeText(card.imageUrl);
      alert('Link copied to clipboard!');
    }
  }

  // Change cards
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