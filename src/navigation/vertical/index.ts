// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Dashboards',
      icon: 'tabler:smart-home',
      path: '/dashboards'
    },
    {
      title: 'Post Generator',
      icon: 'iconoir:post',
      path: '/post-generator'
    },

    // {
    //   title: 'CV Analyzer',
    //   icon: 'streamline:business-user-curriculum',
    //   path: '/cv-analyzer'
    // },
    // {
    //   title: 'Chat con PDFs',
    //   icon: 'dashicons:pdf',
    //   path: '/chat-pdfs'
    // },
    // {
    //   title: 'Generador de READMEs',
    //   icon: 'gg:readme',
    //   path: '/readme-generator'
    // },
    // {
    //   title: 'Commit Assistant',
    //   icon: 'ic:baseline-commit',
    //   path: '/commit-assistant'
    // }
  ]
}

export default navigation
