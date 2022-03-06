import { bg } from './assets'
import { Buffer } from 'buffer'
export default {
  name: 'Light Theme',
  description: 'Default light theme',
  url: 'https://www.grati.co/@gratico/kernel',
  author: 'Abhishiv Saxena<abhishiv@gmail.com>',
  dependencies: [],
  general: {
    //    backgroundColor: "#f6f9fc",
    //    background: ` no-repeat 0% 0% / 100% auto #f6f9fc url("https://s3.us-west-2.amazonaws.com/cdn.www.grati.co/assets/bgs/wave.png")`,
    backgroundColor: '#1f2430',
    foregroundColor: 'white',
    modalBackgroundColor: '#1f2430',
    modalForegroundColor: 'white',
    fontFamily: 'Open Sans',
    headlineFontFamily: 'Titillium Web',
    borderColor: '#555',
    borderStyle: '2px',
    borderWidth: '1px'
  },
  components: {
    sidebar: {}
  }
}
