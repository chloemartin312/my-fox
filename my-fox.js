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
    this.foxes = [];
    this.loading = false;
  }

  // Lit reactive properties
  static get properties() {
    return {
      ...super.properties,
      foxes: { type: Array },
      loading: { type: Boolean },
    };
  }

  // Lit scoped styles
  static get styles() {
    return [super.styles,
    css`
      :host {
        display: block;
        text-align: center;
        padding: 1rem;
        background-color: var(--ddd-theme-default-shrineTan);
        color: black;
      }

      button {
        margin: 1rem;
        padding: 0.5rem 1rem;
        font-size: 1rem;
        background-color: var(--ddd-theme-default-landgrantBrown);
        color: white;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
      }

      img {
        width: 300px;
        height: auto;
        border-radius: 12px;
        box-shadow: 0 2px 10px var(--ddd-theme-default-alertImmediate);
        margin: 1rem;
      }

      .gallery {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
      }
    `];
  }

  connectedCallback() {
    super.connectedCallback();
    const saved = localStorage.getItem('foxGallery');
    if (saved) {
      this.foxes = JSON.parse(saved);
    }
    this.getFoxes();
  }

  async getFoxes() {
    this.loading = true;
    try {
      const response = await fetch("https://randomfox.ca/floof/");
      if (response.ok) {
        // convert to JS object
        const data = await response.json();
        // data.image contains the fox picture URL
        // add new fox to array
        this.foxes = [...this.foxes, data.image]; 
        localStorage.setItem('foxGallery', JSON.stringify(this.foxes));
      }
    } 
    catch (error) {
      console.error("Error fetching fox:", error);
    } 
    finally {
      this.loading = false;
    }
  }

  // Lit render the HTML
  render() {
    return html`
      <button @click="${this.getFoxes}">
        ${this.loading ? "Loading..." : "Get Another Fox"}
      </button>

      <div class="gallery">
        ${this.foxes.map(
          (img) => html`<img src="${img}" alt="A random fox" />`
        )}
      </div>
      `;
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