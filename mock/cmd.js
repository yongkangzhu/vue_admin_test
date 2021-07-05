module.exports = [

  // get proc list
  {
    url: '/vue-admin-template/cmd/procs',
    type: 'get',
    response: config => {
      
      return {
        code: 20000,
        data: ['sajet.a1','sajet.a2','sajet.a3','sajet.a4','sajet.a5']
      }
    }
  }

]
