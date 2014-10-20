exmaple = {
  a: 1
}

itemsInterface = {
  type: string,
}


classInterface = {
  a: {
    required: true,
    nullable: true,
    type: string
  },
  b: {
    required: false,
    type: array,
    items: itemsInterface
  }
}
