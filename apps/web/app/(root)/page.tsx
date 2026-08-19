import { ProductForm } from '@/components/products/product-form'
import React from 'react'

const HomePage = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen py-10'>
      <ProductForm/>
    </div>
  )
}

export default HomePage