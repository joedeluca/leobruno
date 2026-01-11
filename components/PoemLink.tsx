"use client"

import { useState } from "react"
import PoemSlideOut from "./PoemSlideOut"

const POEMS = {
  "the-red-wheelbarrow": {
    title: "The Red Wheelbarrow",
    author: "William Carlos Williams",
    content: `so much depends
upon

a red wheel
barrow

glazed with rain
water

beside the white
chickens.`,
  },
  "mr-eliots-sunday-morning-service": {
    title: "Mr. Eliot's Sunday Morning Service",
    author: "T.S. Eliot",
    content: `Look, look, master, here comes two religious caterpillars.
THE JEW OF MALTA.

Polyphiloprogenitive
The sapient sutlers of the Lord
Drift across the window-panes.
In the beginning was the Word.

In the beginning was the Word.
Superfetation of τὸ ἕν,
And at the mensual turn of time
Produced enervate Origen.

A painter of the Umbrian school
Designed upon a gesso ground
The nimbus of the Baptized God.
The wilderness is cracked and browned

But through the water pale and thin
Still shine the unoffending feet
And there above the painter set
The Father and the Paraclete.

The sable presbyters approach
The avenue of penitence;
The young are red and pustular
Clutching piaculative pence.

Under the penitential gates
Sustained by staring Seraphim
Where the souls of the devout
Burn invisible and dim.

Along the garden-wall the bees
With hairy bellies pass between
The staminate and pistilate,
Blest office of the epicene.

Sweeney shifts from ham to ham
Stirring the water in his bath.
The masters of the subtle schools
Are controversial, polymath.`,
  },
}

interface PoemLinkProps {
  poemId: keyof typeof POEMS
  children: React.ReactNode
}

export default function PoemLink({ poemId, children }: PoemLinkProps) {
  const [isOpen, setIsOpen] = useState(false)
  const poem = POEMS[poemId]

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-tiepolo-pink-600 hover:text-tiepolo-pink-500 underline decoration-tiepolo-pink-600/40 hover:decoration-tiepolo-pink-500 underline-offset-2 transition-colors cursor-pointer"
      >
        {children}
      </button>
      <PoemSlideOut
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={poem.title}
        author={poem.author}
        content={poem.content}
      />
    </>
  )
}
