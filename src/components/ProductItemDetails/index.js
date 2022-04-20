import {Component} from 'react'
import {Link} from 'react-router-dom'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {BsPlusSquare, BsDashSquare} from 'react-icons/bs'
import Header from '../Header'
import SimilarProductItem from '../SimilarProductItem'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class ProductItemDetails extends Component {
  state = {
    itemsCount: 1,
    apiStatus: apiStatusConstants.initial,
    productDetails: {},
    similarProducts: [],
  }

  componentDidMount() {
    this.getProductDetails()
  }

  formatedData = data => ({
    id: data.id,
    imageUrl: data.image_url,
    availability: data.availability,
    brand: data.brand,
    description: data.description,
    price: data.price,
    rating: data.rating,
    style: data.style,
    title: data.title,
    totalReviews: data.total_reviews,
  })

  onClickMinus = () => {
    const {itemsCount} = this.state
    if (itemsCount > 1) {
      this.setState(prevState => ({itemsCount: prevState.itemsCount - 1}))
    }
  }

  onClickPlus = () => {
    this.setState(prevState => ({itemsCount: prevState.itemsCount + 1}))
  }

  getProductDetails = async () => {
    const {match} = this.props
    const {params} = match
    const {id} = params

    this.setState({apiStatus: apiStatusConstants.inProgress})

    const jwtToken = Cookies.get('jwt_token')

    const apiUrl = `https://apis.ccbp.in/products/${id}`
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }

    const response = await fetch(apiUrl, options)

    if (response.ok) {
      const fetchedData = await response.json()
      const updatedProductDetails = this.formatedData(fetchedData)
      const similarProductsList = fetchedData.similar_products.map(data =>
        this.formatedData(data),
      )
      this.setState({
        productDetails: updatedProductDetails,
        similarProducts: similarProductsList,
        apiStatus: apiStatusConstants.success,
      })
    } else if (response.status === 404) {
      this.setState({
        apiStatus: apiStatusConstants.failure,
      })
    }
  }

  renderLoader = () => (
    <div testid="loader" className="loader-container">
      <Loader type="ThreeDots" width={80} height={80} color="#0b69ff" />
    </div>
  )

  renderProductItemDetails = () => {
    const {productDetails, itemsCount} = this.state
    const {
      imageUrl,
      title,
      brand,
      availability,
      description,
      rating,
      totalReviews,
      price,
    } = productDetails
    return (
      <div>
        <div className="product-item-details">
          <div className="image-container">
            <img src={imageUrl} className="product-item-image" alt="product" />
          </div>
          <div className="product-item-content">
            <h1 className="title">{title}</h1>
            <p className="price">Rs {price}</p>
            <div className="rating-box">
              <div className="rating-container">
                <p>{rating}</p>
                <img
                  src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                  className="star-icon"
                  alt="star"
                />
              </div>
              <p className="total-reviews">{totalReviews}</p>
            </div>
            <p className="description">{description}</p>
            <div className="availability-brand-container">
              <p className="available">Available :</p>
              <p className="span-text">{availability}</p>
            </div>
            <div className="availability-brand-container">
              <p className="brand">Brand :</p>
              <p className="span-text">{brand}</p>
            </div>
            <hr className="hr-line" />
            <div className="count-container">
              <button
                testid="minus"
                onClick={this.onClickMinus}
                type="button"
                className="decrease"
              >
                <BsDashSquare />
              </button>
              <p className="items-count">{itemsCount}</p>
              <button
                testid="plus"
                type="button"
                onClick={this.onClickPlus}
                className="increase"
              >
                <BsPlusSquare />
              </button>
            </div>

            <div>
              <button
                type="button"
                className="add-to-cart-button"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
        {this.renderSimilarProducts()}
      </div>
    )
  }

  renderFailureView = () => (
    <div className="product-details-failure-view-container">
      <img
        alt="failure view"
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
        className="failure-view-image"
      />
      <h1 className="product-not-found-heading">Product Not Found</h1>
      <Link to="/products">
        <button type="button" className="button">
          Continue Shopping
        </button>
      </Link>
    </div>
  )

  

  renderSimilarProducts = () => {
    const {similarProducts} = this.state
    return (
      <div className="similar-products-container">
        <h1 className="similar-products-heading">Similar Products</h1>
        <ul className="similar-products-list">
          {similarProducts.map(eachProduct => (
            <SimilarProductItem
              eachProduct={eachProduct}
              key={eachProduct.id}
            />
          ))}
        </ul>
      </div>
    )
  }

  renderProductsItemViews = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderProductItemDetails()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      case apiStatusConstants.inProgress:
        return this.renderLoader()
      default:
        return null
    }
  }

  render() {
    const {apiStatus} = this.state
    return (
      <div className="product-item-details-container">
        <Header />
        {this.renderProductsItemViews()}
      </div>
    )
  }
}
export default ProductItemDetails
