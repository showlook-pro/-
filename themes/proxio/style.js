/* eslint-disable react/no-unknown-property */

/**
 * 此处样式只对当前主题生效
 * 此处不支持tailwindCSS的 @apply 语法
 * @returns
 */
const Style = () => {
    return <style jsx global>{`

    // 底色
    body{
        --proxio-primary: #3858F9;
        --proxio-primary-hover: #1B44C8;
        --proxio-float-neutral: #5c5c5c;
        --proxio-float-neutral-hover: #4a4a4a;
        --proxio-reading-font-family: -apple-system, BlinkMacSystemFont,
          'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
        --proxio-mobile-reading-size: 18px;
        --proxio-mobile-reading-weight: 300;
        --proxio-mobile-reading-line: 1.92;
        --proxio-mobile-list-line: 1.68;
        --proxio-mobile-reading-tracking: 0.014em;
        --proxio-mobile-reading-color: rgba(29, 29, 31, 0.72);
        --proxio-mobile-muted-color: rgba(29, 29, 31, 0.58);
        --proxio-mobile-block-gap: 1.45em;
        background-color: white;
    }
    .dark body{
        background-color: black;
    }

    #theme-proxio .bg-primary {
        --tw-bg-opacity: 1;
        background-color: var(--proxio-primary);
    }

    #theme-proxio .text-primary {
        color: var(--proxio-primary) !important;
    }

    #theme-proxio .border-primary {
        border-color: var(--proxio-primary) !important;
    }

    #theme-proxio .hover\\:bg-primary:hover,
    #theme-proxio .hover\\:bg-blue-dark:hover {
        background-color: var(--proxio-primary-hover) !important;
    }

    #theme-proxio .hover\\:text-primary:hover {
        color: var(--proxio-primary) !important;
    }

    #theme-proxio .focus\\:border-primary:focus,
    #theme-proxio .focus-visible\\:border-primary:focus-visible {
        border-color: var(--proxio-primary) !important;
    }
    
    @media (min-width: 540px) {
        #theme-proxio .container {
            max-width: 540px;
        }
    }
    @media (min-width: 720px) {
        #theme-proxio .container {
            max-width: 720px;
        }
    }
    
    @media (min-width: 960px) {
        #theme-proxio .container {
            max-width: 960px;
        }
    }
    @media (min-width: 1140px) {
        #theme-proxio .container {
            max-width: 1140px;
        }
    }
        
    @media (min-width: 1536px) {
        #theme-proxio .container {
            max-width: 1140px;
        }
    }
        

    #theme-proxio .container {
        width: 100%;
        margin-right: auto;
        margin-left: auto;
        padding-right: 16px;
        padding-left: 16px;
    }

  #theme-proxio .sticky{
    position: fixed;
    z-index: 20;
    background-color: rgb(255 255 255 / 0.8);
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-backdrop-filter;
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-backdrop-filter;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
  

  .dark\:bg-dark:is(.dark *) {
    background-color: black!important;
 }

  :is(.dark #theme-proxio .sticky){
    background-color: rgb(17 25 40 / 0.8);
  }
  
  #theme-proxio .sticky {
    -webkit-backdrop-filter: blur(5px);
            backdrop-filter: blur(5px);
    box-shadow: inset 0 -1px 0 0 rgba(0, 0, 0, 0.1);
  }
  
  #theme-proxio .sticky .navbar-logo{
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
  
  #theme-proxio .sticky #navbarToggler span{
    --tw-bg-opacity: 1;
    background-color: rgb(17 25 40 / var(--tw-bg-opacity));
  }
  
  :is(.dark #theme-proxio .sticky #navbarToggler span){
    --tw-bg-opacity: 1;
    background-color: rgb(255 255 255 / var(--tw-bg-opacity));
  }
  
  #theme-proxio .sticky #navbarCollapse li > a{
    --tw-text-opacity: 1;
    color: rgb(17 25 40 / var(--tw-text-opacity));
  }
  
  #theme-proxio .sticky #navbarCollapse li > a:hover{
    --tw-text-opacity: 1;
    color: var(--proxio-primary);
    opacity: 1;
  }

  #theme-proxio .sticky #navbarCollapse li > button{
    --tw-text-opacity: 1;
    color: rgb(17 25 40 / var(--tw-text-opacity));
  }
  
  :is(.dark #theme-proxio .sticky #navbarCollapse li > a){
    --tw-text-opacity: 1;
    color: rgb(255 255 255 / var(--tw-text-opacity));
  }
  
  :is(.dark #theme-proxio .sticky #navbarCollapse li > a:hover){
    --tw-text-opacity: 1;
    color: var(--proxio-primary);
  }

  :is(.dark #theme-proxio .sticky #navbarCollapse li > button){
    --tw-text-opacity: 1;
    color: rgb(255 255 255 / var(--tw-text-opacity));
  }

  #theme-proxio .ud-header.nav-solid .header-logo-text,
  #theme-proxio .ud-header.nav-solid .ud-menu-scroll,
  #theme-proxio .ud-header.nav-solid .submenu-item > button{
    color: #ffffff;
  }

  #theme-proxio .ud-header.nav-transparent.nav-inner .header-logo-text,
  #theme-proxio .ud-header.nav-transparent.nav-inner .ud-menu-scroll,
  #theme-proxio .ud-header.nav-transparent.nav-inner .submenu-item > button{
    color: #111928;
  }

  #theme-proxio .ud-header.nav-transparent.nav-home .header-logo-text,
  #theme-proxio .ud-header.nav-transparent.nav-home .ud-menu-scroll,
  #theme-proxio .ud-header.nav-transparent.nav-home .submenu-item > button{
    color: #ffffff;
  }

  #theme-proxio .ud-header.nav-transparent.nav-inner #navbarToggler span{
    background-color: #111928;
  }

  #theme-proxio .ud-header.nav-solid #navbarToggler span{
    background-color: #ffffff;
  }

  #theme-proxio .ud-header .header-logo-icon{
    transition: filter 0.2s ease;
  }

  #theme-proxio .ud-header .header-logo-icon{
    filter: brightness(0) invert(1);
  }

  html:not(.dark) #theme-proxio .footer-logo-icon{
    filter: none;
  }

  html.dark #theme-proxio .footer-logo-icon{
    filter: brightness(0) invert(1);
  }

  @media (max-width: 959px) {
    #theme-proxio #navbarCollapse .ud-menu-scroll,
    #theme-proxio #navbarCollapse .submenu-item > button{
      color: #111928;
    }

    #theme-proxio #navbarCollapse .submenu a{
      color: #111928;
    }

    html.dark #theme-proxio #navbarCollapse .ud-menu-scroll,
    html.dark #theme-proxio #navbarCollapse .submenu-item > button,
    html.dark #theme-proxio #navbarCollapse .submenu a{
      color: #ffffff;
    }
  }

  @media (min-width: 960px) {
    html.dark #theme-proxio #navbarCollapse .ud-menu-scroll,
    html.dark #theme-proxio #navbarCollapse .submenu-item > button,
    html.dark #theme-proxio #navbarCollapse .submenu a{
      color: #ffffff;
    }
  }


  #navbarCollapse li .ud-menu-scroll.active{
    opacity: 0.7;
  }
  
  #theme-proxio .sticky #navbarCollapse li .ud-menu-scroll.active{
    --tw-text-opacity: 1;
    color: var(--proxio-primary);
    opacity: 1;
  }
  
  #theme-proxio .sticky .loginBtn{
    --tw-text-opacity: 1;
    color: rgb(17 25 40 / var(--tw-text-opacity));
  }
  
  #theme-proxio .sticky .loginBtn:hover{
    --tw-text-opacity: 1;
    color: var(--proxio-primary);
    opacity: 1;
  }
  
  :is(.dark #theme-proxio .sticky .loginBtn){
    --tw-text-opacity: 1;
    color: rgb(255 255 255 / var(--tw-text-opacity));
  }
  
  :is(.dark #theme-proxio .sticky .loginBtn:hover){
    --tw-text-opacity: 1;
    color: var(--proxio-primary);
  }
  
  #theme-proxio .sticky .signUpBtn{
    --tw-bg-opacity: 1;
    background-color: var(--proxio-primary);
    --tw-text-opacity: 1;
    color: rgb(255 255 255 / var(--tw-text-opacity));
  }
  
  #theme-proxio .sticky .signUpBtn:hover{
    --tw-bg-opacity: 1;
    background-color: rgb(27 68 200 / var(--tw-bg-opacity));
    --tw-text-opacity: 1;
    color: rgb(255 255 255 / var(--tw-text-opacity));
  }
  
  #theme-proxio .sticky #themeSwitcher ~ span{
    --tw-text-opacity: 1;
    color: rgb(17 25 40 / var(--tw-text-opacity));
  }
  
  :is(.dark #theme-proxio .sticky #themeSwitcher ~ span){
    --tw-text-opacity: 1;
    color: rgb(255 255 255 / var(--tw-text-opacity));
  }
  
  .navbarTogglerActive > span:nth-child(1){
    top: 7px;
    --tw-rotate: 45deg;
    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  }
  
  .navbarTogglerActive > span:nth-child(2){
    opacity: 0;
  }
  
  .navbarTogglerActive > span:nth-child(3){
    top: -8px;
    --tw-rotate: 135deg;
    transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
  }
  
  .text-body-color{
    --tw-text-opacity: 1;
    color: rgb(99 115 129 / var(--tw-text-opacity));
  }
  
  .text-body-secondary{
    --tw-text-opacity: 1;
    color: rgb(136 153 168 / var(--tw-text-opacity));
  }

  #theme-proxio .scroll-hint__text{
    letter-spacing: 0.08em;
  }

  @keyframes scroll-hint-float{
    0%{
      transform: translateY(-2px);
      opacity: 0.35;
    }
    50%{
      transform: translateY(6px);
      opacity: 0.7;
    }
    100%{
      transform: translateY(-2px);
      opacity: 0.35;
    }
  }

  @keyframes scroll-hint-fade{
    0%{
      opacity: 0.35;
    }
    50%{
      opacity: 0.7;
    }
    100%{
      opacity: 0.35;
    }
  }

  #theme-proxio .proxio-blog-card{
    position: relative;
    display: block;
  }

  #theme-proxio .proxio-blog-card__image{
    display: block;
    transition: transform 0.5s ease, filter 0.3s ease, opacity 0.3s ease;
  }

  #theme-proxio .proxio-blog-card__overlay{
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    text-align: center;
    opacity: 0;
    background-color: rgba(255, 255, 255, 0.6);
    -webkit-backdrop-filter: blur(6px);
            backdrop-filter: blur(6px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }

  #theme-proxio .proxio-blog-card__summary{
    max-width: 370px;
    font-size: 1rem;
    line-height: 1.6;
    color: rgb(17 25 40);
  }

  #theme-proxio .proxio-blog-card:hover .proxio-blog-card__image{
    filter: blur(6px);
    opacity: 0.4;
    transform: scale(1.03);
  }

  #theme-proxio .proxio-blog-card:hover .proxio-blog-card__overlay{
    opacity: 1;
  }

  :is(.dark #theme-proxio .proxio-blog-card__overlay){
    background-color: rgba(0, 0, 0, 0.6);
  }

  :is(.dark #theme-proxio .proxio-blog-card__summary){
    color: rgb(255 255 255);
  }

  #theme-proxio .proxio-float-button {
    border: 0;
    background-color: var(--proxio-float-neutral) !important;
    color: #ffffff !important;
  }

  #theme-proxio .proxio-float-button:hover {
    background-color: var(--proxio-float-neutral-hover) !important;
    color: #ffffff !important;
  }

  #theme-proxio .proxio-toc-float-button {
    background: linear-gradient(
      to bottom,
      var(--proxio-primary) var(--proxio-toc-progress, 0%),
      var(--proxio-float-neutral) var(--proxio-toc-progress, 0%)
    ) !important;
  }

  #theme-proxio .proxio-toc-float-button:hover {
    filter: brightness(0.95);
  }

  #theme-proxio .proxio-toc-drawer {
    width: 100vw;
    min-height: 100dvh;
    overscroll-behavior: contain;
    overflow-x: hidden;
    overflow-y: auto;
    color: var(--proxio-mobile-reading-color);
    font-family: var(--proxio-reading-font-family);
    font-size: var(--proxio-mobile-reading-size);
    font-weight: var(--proxio-mobile-reading-weight);
    line-height: var(--proxio-mobile-reading-line);
    letter-spacing: var(--proxio-mobile-reading-tracking);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  #theme-proxio .proxio-toc-drawer-close {
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 51;
    display: flex;
    width: 44px;
    height: 44px;
    align-items: center;
    justify-content: center;
    border: 0;
    background: transparent;
    color: #8a8a8a;
    font-size: 20px;
    line-height: 1;
    box-shadow: none;
    cursor: pointer;
  }

  #theme-proxio .proxio-toc-drawer-close:hover {
    background: transparent;
    color: #5c5c5c;
  }

  #theme-proxio .proxio-toc-drawer-content {
    min-height: 100dvh;
    overflow: visible;
    padding: 0;
  }

  #theme-proxio .proxio-toc-drawer .proxio-catalog-panel {
    min-height: 100dvh;
    padding: 72px clamp(26px, 7vw, 40px) 56px;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
  }

  #theme-proxio .proxio-catalog-header {
    display: flex;
    align-items: center;
    gap: 0.6em;
    color: #111928;
    font-family: inherit;
    font-size: inherit;
    font-weight: 600;
    line-height: 1.4;
    letter-spacing: inherit;
  }

  #theme-proxio .proxio-catalog-icon {
    display: inline-flex;
    width: 1.05em;
    flex-direction: column;
    gap: 0.2em;
  }

  #theme-proxio .proxio-catalog-icon span {
    display: block;
    height: 2px;
    border-radius: 999px;
    background: currentColor;
  }

  #theme-proxio .proxio-catalog-progress {
    height: 3px;
    margin: 1em 0 1.35em;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(17, 25, 40, 0.08);
  }

  #theme-proxio .proxio-catalog-progress span {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: var(--proxio-primary);
  }

  #theme-proxio .proxio-catalog-scroll {
    height: auto;
    max-height: none;
    overflow: visible;
    overscroll-behavior: auto;
  }

  #theme-proxio .proxio-catalog-nav {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  #theme-proxio .proxio-catalog-link {
    display: block;
    padding-top: 0.72em;
    padding-bottom: 0.72em;
    border-bottom: 1px solid rgba(17, 25, 40, 0.08);
    color: var(--proxio-mobile-reading-color) !important;
    font-family: var(--proxio-reading-font-family) !important;
    font-size: var(--proxio-mobile-reading-size) !important;
    font-weight: var(--proxio-mobile-reading-weight) !important;
    line-height: var(--proxio-mobile-list-line) !important;
    letter-spacing: var(--proxio-mobile-reading-tracking) !important;
    text-decoration: none !important;
  }

  #theme-proxio .proxio-catalog-link:hover,
  #theme-proxio .proxio-catalog-link.is-active {
    color: var(--proxio-primary) !important;
    font-weight: 520 !important;
  }

  #theme-proxio .proxio-catalog-text {
    display: block;
    overflow: visible;
    text-overflow: clip;
    white-space: normal;
  }

  #theme-proxio #notion-article .notion-simple-table {
    display: table !important;
    width: 100% !important;
    margin: 1.7em 0 2em !important;
    border: 0 !important;
    border-collapse: separate;
    border-spacing: 0;
    background: transparent;
    color: inherit !important;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit !important;
    letter-spacing: inherit;
    table-layout: auto;
    white-space: normal !important;
  }

  #theme-proxio #notion-article .notion-simple-table td {
    padding: 0.82em 1em !important;
    border: 0 !important;
    border-bottom: 1px solid #e1e7ef !important;
    background: transparent !important;
    color: inherit !important;
    font-family: inherit;
    font-size: inherit;
    font-weight: inherit;
    letter-spacing: inherit;
    vertical-align: middle;
    white-space: pre-wrap;
    word-break: normal;
    overflow-wrap: normal;
    line-height: inherit !important;
  }

  #theme-proxio #notion-article .notion-simple-table-cell {
    min-height: inherit;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    line-height: 2 !important;
  }

  #theme-proxio #notion-article .notion-simple-table-header-row td {
    border-top: 0 !important;
    border-bottom-color: #d8e0ea !important;
    background: #f3f6fa !important;
    color: inherit !important;
    font-weight: 600;
  }

  #theme-proxio
    #notion-article
    .notion-simple-table
    td.notion-simple-table-header-cell {
    font-weight: 600;
  }

  #theme-proxio #notion-article .notion-simple-table .notion-text {
    margin: 0 !important;
    padding: 0 !important;
    color: inherit !important;
    font: inherit;
    letter-spacing: inherit;
    line-height: 2 !important;
    text-align: left !important;
    text-align-last: left !important;
  }

  html.dark #theme-proxio .proxio-catalog-header {
    color: #ffffff;
  }

  html.dark #theme-proxio .proxio-catalog-progress {
    background: rgba(255, 255, 255, 0.12);
  }

  html.dark #theme-proxio .proxio-catalog-link {
    border-bottom-color: rgba(255, 255, 255, 0.1);
  }

  html.dark #theme-proxio #notion-article .notion-simple-table td {
    border-bottom-color: rgba(255, 255, 255, 0.14) !important;
  }

  html.dark
    #theme-proxio
    #notion-article
    .notion-simple-table-header-row
    td {
    background: rgba(255, 255, 255, 0.08) !important;
    border-bottom-color: rgba(255, 255, 255, 0.2) !important;
  }

  @media (max-width: 719px) {
    #theme-proxio #container-inner {
      padding-left: 0 !important;
      padding-right: 0 !important;
    }

    #theme-proxio #article-wrapper {
      width: 100%;
      max-width: 100%;
    }

    #theme-proxio #notion-article {
      padding-left: clamp(18px, 5vw, 26px) !important;
      padding-right: clamp(18px, 5vw, 26px) !important;
      color: var(--proxio-mobile-reading-color);
      font-family: var(--proxio-reading-font-family);
      font-size: var(--proxio-mobile-reading-size);
      font-weight: var(--proxio-mobile-reading-weight);
      line-height: var(--proxio-mobile-reading-line);
      letter-spacing: var(--proxio-mobile-reading-tracking);
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }

    #theme-proxio #notion-article .notion-page-content-inner {
      width: 100%;
      max-width: 100%;
      gap: 0;
    }

    #theme-proxio #notion-article .notion-text {
      margin: 0 0 var(--proxio-mobile-block-gap) !important;
      padding: 0 !important;
      color: var(--proxio-mobile-reading-color) !important;
      font-size: var(--proxio-mobile-reading-size);
      font-weight: var(--proxio-mobile-reading-weight);
      line-height: var(--proxio-mobile-reading-line) !important;
      letter-spacing: var(--proxio-mobile-reading-tracking);
      word-break: normal;
      overflow-wrap: break-word;
    }

    #theme-proxio #notion-article .notion-text,
    #theme-proxio #notion-article .notion-list li,
    #theme-proxio #notion-article .notion-to-do-body,
    #theme-proxio #notion-article .notion-callout-text {
      text-align: justify;
      text-align-last: left;
      text-justify: inter-ideograph;
    }

    #theme-proxio #notion-article .notion-text:empty,
    #theme-proxio #notion-article .notion-blank {
      min-height: 1.15em;
      margin: 0 0 0.55em !important;
      padding: 0 !important;
    }

    #theme-proxio #notion-article b,
    #theme-proxio #notion-article strong {
      color: rgba(29, 29, 31, 0.86);
      font-weight: 520;
    }

    #theme-proxio #notion-article .notion-link {
      color: inherit !important;
      border-bottom: 1px solid rgba(29, 29, 31, 0.22) !important;
      text-decoration: none !important;
    }

    #theme-proxio #notion-article .notion-link:hover {
      color: var(--proxio-primary) !important;
      border-color: currentColor !important;
    }

    #theme-proxio #notion-article .notion-inline-code {
      padding: 0.12em 0.38em;
      border-radius: 8px;
      background: #f1f1f3;
      color: rgba(29, 29, 31, 0.82);
      font-family:
        'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      font-size: 0.82em;
      font-weight: 400;
      letter-spacing: 0;
      word-break: break-word;
    }

    #theme-proxio #notion-article .notion-h {
      margin: 2em 0 0.78em !important;
      padding: 0 !important;
      color: #111928 !important;
      font-weight: 560;
      line-height: 1.36 !important;
      letter-spacing: 0.01em;
    }

    #theme-proxio #notion-article .notion-h:first-child {
      margin-top: 0.4em !important;
    }

    #theme-proxio #notion-article .notion-h1 {
      font-size: 1.38em;
    }

    #theme-proxio #notion-article .notion-h2 {
      font-size: 1.22em;
    }

    #theme-proxio #notion-article .notion-h3 {
      font-size: 1.08em;
    }

    #theme-proxio #notion-article .notion-list {
      margin: 0.18em 0 1.28em !important;
      color: var(--proxio-mobile-reading-color) !important;
      font-size: var(--proxio-mobile-reading-size);
      font-weight: var(--proxio-mobile-reading-weight);
      line-height: var(--proxio-mobile-list-line) !important;
      letter-spacing: var(--proxio-mobile-reading-tracking);
    }

    #theme-proxio #notion-article .notion-list:has(+ .notion-list) {
      margin-bottom: 0.2em !important;
    }

    #theme-proxio #notion-article .notion-list + .notion-list {
      margin-top: 0 !important;
    }

    #theme-proxio #notion-article .notion-list-disc {
      padding-inline-start: 1.08em !important;
    }

    #theme-proxio #notion-article .notion-list-numbered {
      padding-inline-start: 1.38em !important;
    }

    #theme-proxio #notion-article .notion-list li {
      margin: 0 0 0.06em !important;
      padding-left: 0.34em !important;
      line-height: inherit !important;
      word-break: normal;
      overflow-wrap: break-word;
    }

    #theme-proxio #notion-article .notion-list li:last-child {
      margin-bottom: 0 !important;
    }

    #theme-proxio #notion-article .notion-list li::marker {
      color: var(--proxio-mobile-muted-color);
      font-size: 0.72em;
    }

    #theme-proxio #notion-article .notion-text-children {
      padding-left: 1.15em;
    }

    #theme-proxio #notion-article .notion-quote {
      margin: 1.6em 0 !important;
      padding: 0.18em 0 0.18em 0.95em !important;
      color: rgba(29, 29, 31, 0.62) !important;
      font-size: 17px;
      font-weight: var(--proxio-mobile-reading-weight);
      line-height: 1.85 !important;
      letter-spacing: 0.03em;
      border-left-color: rgba(29, 29, 31, 0.22) !important;
    }

    #theme-proxio #notion-article .notion-callout {
      margin: 1.55em 0 !important;
      padding: 14px 16px !important;
      border: 0 !important;
      border-radius: 18px !important;
      background: #f5f5f7 !important;
    }

    #theme-proxio #notion-article .notion-callout-text {
      color: rgba(29, 29, 31, 0.74) !important;
      font-size: 16px;
      font-weight: 300;
      line-height: 1.75 !important;
      letter-spacing: 0.02em;
    }

    #theme-proxio #notion-article .notion-callout .notion-text,
    #theme-proxio #notion-article .notion-callout .notion-list {
      margin-bottom: 0.65em !important;
      color: inherit !important;
      font-size: inherit;
      line-height: inherit !important;
      letter-spacing: inherit;
    }

    #theme-proxio #notion-article .notion-toggle {
      margin: 1.25em 0 !important;
      padding: 0 !important;
      color: var(--proxio-mobile-reading-color);
      font-size: var(--proxio-mobile-reading-size);
      font-weight: var(--proxio-mobile-reading-weight);
      line-height: var(--proxio-mobile-reading-line);
      letter-spacing: var(--proxio-mobile-reading-tracking);
    }

    #theme-proxio #notion-article .notion-toggle > summary {
      padding: 0.18em 0;
      color: rgba(29, 29, 31, 0.8);
      font-weight: 420;
    }

    #theme-proxio #notion-article .notion-toggle > div {
      margin-left: 1.05em;
      padding-top: 0.55em;
    }

    #theme-proxio #notion-article .notion-hr {
      margin: 2em 0 !important;
      border-top-color: rgba(29, 29, 31, 0.1) !important;
    }

    #theme-proxio #notion-article .notion-asset-wrapper {
      margin: 1.8em 0 2em !important;
    }

    #theme-proxio #notion-article .notion-asset-caption {
      padding-top: 0.65em !important;
      color: var(--proxio-mobile-muted-color) !important;
      font-size: 13px;
      line-height: 1.55 !important;
      letter-spacing: 0.01em;
    }

    #theme-proxio #notion-article .notion-code {
      margin: 1.45em 0 1.8em !important;
      padding: 16px !important;
      border-radius: 16px !important;
      background: #f5f5f7 !important;
      color: rgba(29, 29, 31, 0.82);
      font-size: 13px;
      font-weight: 400;
      line-height: 1.7 !important;
      letter-spacing: 0;
    }

    #theme-proxio #notion-article .notion-table,
    #theme-proxio #notion-article .notion-table-view,
    #theme-proxio #notion-article .notion-collection,
    #theme-proxio #notion-article .notion-form-view,
    #theme-proxio #notion-article .notion-form-collection-wrapper {
      color: #111928 !important;
      font-size: 14px;
      font-weight: 400;
      line-height: 1.5 !important;
      letter-spacing: normal;
    }

    #theme-proxio #notion-article .notion-table *,
    #theme-proxio #notion-article .notion-collection *,
    #theme-proxio #notion-article .notion-form-view *,
    #theme-proxio #notion-article .notion-form-collection-wrapper * {
      letter-spacing: normal;
    }

    #theme-proxio #notion-article .notion-table .notion-text,
    #theme-proxio #notion-article .notion-table .notion-list,
    #theme-proxio #notion-article .notion-collection .notion-text,
    #theme-proxio #notion-article .notion-collection .notion-list,
    #theme-proxio #notion-article .notion-form-view .notion-text,
    #theme-proxio #notion-article .notion-form-view .notion-list,
    #theme-proxio
      #notion-article
      .notion-form-collection-wrapper
      .notion-text,
    #theme-proxio
      #notion-article
      .notion-form-collection-wrapper
      .notion-list {
      margin: 0 !important;
      color: inherit !important;
      font-size: inherit;
      font-weight: inherit;
      line-height: inherit !important;
      letter-spacing: normal;
    }

    #theme-proxio #notion-article .notion-simple-table {
      color: var(--proxio-mobile-reading-color) !important;
      font-size: var(--proxio-mobile-reading-size);
      font-weight: var(--proxio-mobile-reading-weight);
      line-height: var(--proxio-mobile-reading-line) !important;
      letter-spacing: var(--proxio-mobile-reading-tracking);
    }

    #theme-proxio #notion-article .notion-simple-table-cell,
    #theme-proxio #notion-article .notion-simple-table .notion-text {
      line-height: inherit !important;
    }
  }

  
.common-carousel .swiper-button-next:after,
.common-carousel .swiper-button-prev:after{
  display: none;
}

.common-carousel .swiper-button-next,
.common-carousel .swiper-button-prev{
  position: static !important;
  margin: 0px;
  height: 3rem;
  width: 3rem;
  border-radius: 0.5rem;
  --tw-bg-opacity: 1;
  background-color: rgb(255 255 255 / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: rgb(17 25 40 / var(--tw-text-opacity));
  --tw-shadow: 0px 8px 15px 0px rgba(72, 72, 138, 0.08);
  --tw-shadow-colored: 0px 8px 15px 0px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
}

.common-carousel .swiper-button-next:hover,
.common-carousel .swiper-button-prev:hover{
  --tw-bg-opacity: 1;
  background-color: var(--proxio-primary);
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
  --tw-shadow: 0 0 #0000;
  --tw-shadow-colored: 0 0 #0000;
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

:is(.dark .common-carousel .swiper-button-next),:is(.dark 
.common-carousel .swiper-button-prev){
  --tw-bg-opacity: 1;
  background-color: rgb(17 25 40 / var(--tw-bg-opacity));
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}

.common-carousel .swiper-button-next svg,
.common-carousel .swiper-button-prev svg{
  height: auto;
  width: auto;
}
  `}</style>
}

export { Style }
