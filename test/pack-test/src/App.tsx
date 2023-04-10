import { useState } from 'react'
import FontPicker from 'react-fontpicker-ts-lite'
import 'react-fontpicker-ts-lite/dist/index.css'

export default function App() {
  const [font1, setFont1] = useState('')

  return (
    <>
      <div>
        <h1>Fontpicker-Lite Test</h1>
        <h3 id="autoload">Autoload fonts</h3>
        <p>
          Automatically load fonts by setting the <code>autoLoad</code> prop.
        </p>
        <div>
          <FontPicker
            autoLoad
            defaultValue="Bad Script"
            value={(font1: string) => setFont1(font1)}
            data-testid="autoload-fontpicker"
          />
        </div>
        <p data-testid="autoload-value">
          Current value: <span style={{ fontFamily: font1 }}>{font1}</span>
        </p>
      </div>
    </>
  )
}