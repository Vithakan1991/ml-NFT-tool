import React from 'react'
import { withRouter } from 'next/router'
import { connect } from 'react-redux'
import CreateForm from './Components/CreateForm'

class CreateNFT extends React.PureComponent {
  constructor(props) {
    super(props)
  }
  render() {
    return (
      <div>
        <CreateForm />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
})

export default withRouter(connect(mapStateToProps, null)(CreateNFT))
