// ** Type import
import { HorizontalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): HorizontalNavItemsType => {
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
    }
  ]
}

export default navigation
