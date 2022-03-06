import { bg } from './assets'
import { Buffer } from 'buffer'
export default {
  name: 'Light Theme',
  description: 'Default light theme',
  url: 'https://www.grati.co/@gratico/kernel',
  author: 'Abhishiv Saxena<abhishiv@gmail.com>',
  dependencies: [],
  general: {
    backgroundColor: 'rgb(10,14,20)',
    background: `data:image/svg+xml;base64,${Buffer.from(bg).toString('base64')}`,
    foregroundColor: 'white',
    modalBackgroundColor: 'rgb(10,14,20)',
    modalForegroundColor: 'white',
    fontFamily: 'Open Sans',
    headlineFontFamily: 'Slabo 27px',
    borderColor: '#555',
    borderStyle: '2px',
    borderWidth: '1px'
  },
  components: {
    sidebar: {}
  }
}
