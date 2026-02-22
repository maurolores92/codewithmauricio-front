// ** React Import
import { Children } from 'react'

// ** Next Import
import Document, { Html, Head, Main, NextScript } from 'next/document'

// ** Emotion Imports
import createEmotionServer from '@emotion/server/create-instance'

// ** Utils Imports
import { createEmotionCache } from 'src/@core/utils/create-emotion-cache'

class CustomDocument extends Document {
  render() {
    return (
      <Html lang='es'>
        <Head>
          {/* Fonts */}
          <link rel='preconnect' href='https://fonts.googleapis.com' />
          <link rel='preconnect' href='https://fonts.gstatic.com' />
          <link
            rel='stylesheet'
            href='https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap'
          />
          
          {/* Favicons */}
          <link rel='apple-touch-icon' sizes='180x180' href='/images/apple-touch-icon.png' />
          <link rel='shortcut icon' href='/images/favicon.png' />
          <link rel='icon' type='image/png' sizes='32x32' href='/images/favicon.png' />
          
          {/* Theme Color */}
          <meta name='theme-color' content='#6366F1' />
          <meta name='msapplication-TileColor' content='#6366F1' />
          
          {/* JSON-LD Structured Data */}
          <script
            type='application/ld+json'
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Person',
                name: 'Mauricio Lores',
                jobTitle: 'Full Stack Developer',
                url: 'https://codewithmauricio.tech',
                sameAs: [
                  'https://github.com/maurolores92',
                  'https://www.linkedin.com/in/mauricio-lores/'
                ],
                knowsAbout: [
                  'React',
                  'Next.js',
                  'NestJS',
                  'TypeScript',
                  'PostgreSQL',
                  'AI Integration',
                  'REST APIs',
                  'Full Stack Development'
                ],
                description:
                  'Full Stack Developer especializado en React, NestJS y PostgreSQL. Construyo herramientas con IA, APIs REST y MVPs rápidos.'
              })
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

CustomDocument.getInitialProps = async ctx => {
  const originalRenderPage = ctx.renderPage
  const cache = createEmotionCache()
  const { extractCriticalToChunks } = createEmotionServer(cache)

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: App => props =>
        (
          <App
            {...props} // @ts-ignore
            emotionCache={cache}
          />
        )
    })

  const initialProps = await Document.getInitialProps(ctx)
  const emotionStyles = extractCriticalToChunks(initialProps.html)
  const emotionStyleTags = emotionStyles.styles.map(style => {
    return (
      <style
        key={style.key}
        dangerouslySetInnerHTML={{ __html: style.css }}
        data-emotion={`${style.key} ${style.ids.join(' ')}`}
      />
    )
  })

  return {
    ...initialProps,
    styles: [...Children.toArray(initialProps.styles), ...emotionStyleTags]
  }
}

export default CustomDocument
