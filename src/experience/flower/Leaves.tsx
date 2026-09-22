import { leaves } from './flowerRig'
import { Leaf } from './Leaf'

export function Leaves() {
  return (
    <>
      <Leaf attachment={leaves[0]} driver="leaf1" />
      <Leaf attachment={leaves[1]} driver="leaf2" />
    </>
  )
}
