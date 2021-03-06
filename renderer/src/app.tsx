import { editor } from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import {
  FC,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

window.MonacoEnvironment = {
  getWorker(_: unknown, label: string) {
    switch (label) {
      case 'css':
        return new cssWorker()
      case 'html':
        return new htmlWorker()
      default:
        return new editorWorker()
    }
  },
}

const App: FC = () => {
  const [css, setCss] = useState('')
  const [url, setUrl] = useState('')
  const ref = useRef(false)
  const iframe = useRef<HTMLIFrameElement>(null)

  useLayoutEffect(() => {
    const container = document.querySelector<HTMLElement>('#container')
    if (container === null || ref.current) return

    const instance = editor.create(container, {
      value: '',
      language: 'css',
      minimap: {
        enabled: false,
      },
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
      scrollbar: {
        vertical: 'hidden',
      },
      overviewRulerBorder: false,
      wordWrap: 'on',
    })

    instance.onDidChangeModelContent(() => {
      setCss(instance.getValue())
    })

    ref.current = true
  }, [])

  useEffect(() => {
    if (!iframe.current?.contentDocument) return
    const style = iframe.current.contentDocument.querySelector('#custom')
    if (style === null) return
    style.innerHTML = css
  }, [css])

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(
    (event) => {
      event.preventDefault()
      if (iframe.current === null) return

      iframe.current.src = url
      iframe.current.onload = () => {
        if (!iframe.current?.contentDocument) return
        const style = iframe.current.contentDocument.createElement('style')
        style.id = 'custom'
        iframe.current.contentDocument.head.append(style)
      }
    },
    [url]
  )

  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
      }}
    >
      <div
        style={{
          height: '100%',
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', width: '100%' }}
        >
          <input
            type="text"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            style={{ flex: '1 1' }}
          />
          <button type="submit">select</button>
        </form>
        <div id="container" style={{ marginTop: '0px', height: '100%' }} />
      </div>
      <iframe ref={iframe} style={{ width: '50%', height: '100%' }} />
    </div>
  )
}

export default App
