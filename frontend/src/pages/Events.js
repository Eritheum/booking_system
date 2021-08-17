import "./Events.css";
import Modal from "../components/Modal/Modal";
import Backdrop from "../components/Backdrop/Backdrop";
import React, { Fragment, Component } from "react";
import AuthContext from "../context/auth-context";
import EventList from "../components/Events/EventList/EventList";
import Spinner from "../components/Spinner/Spinner";

class EventPage extends Component {
  state = {
    isCreating: false,
    events: [],
    isLoading: false,
    selectedEvent: null,
  };

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.titleRef = React.createRef();
    this.priceRef = React.createRef();
    this.dateRef = React.createRef();
    this.descriptionRef = React.createRef();
  }

  componentDidMount() {
    this.fetchEvents();
  }

  createEventHandler = () => {
    this.setState({ isCreating: true });
  };

  onCancelModal = () => {
    this.setState({ isCreating: false, selectedEvent: null });
  };

  bookEventHandler = () => {
    if (!this.context.token) {
      this.setState({ selectedEvent: null });
      return;
    }
    const requestBody = {
      query: `
        mutation {
          bookEvent (eventId: "${this.state.selectedEvent._id}") {
            _id
            createdAt
            updatedAt
          }
        }
      `,
    };

    fetch("http://localhost:8000/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + this.context.token,
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Login Failed!");
        }
        return res.json();
      })
      .then((resData) => {
        console.log(resData);
        this.setState({ selectedEvent: null });
      })
      .catch((err) => {
        throw err;
      });
  };

  onConfirmModal = () => {
    this.setState({ isCreating: false });
    const title = this.titleRef.current.value;
    const price = this.priceRef.current.value;
    const date = this.dateRef.current.value;
    const description = this.descriptionRef.current.value;

    if (
      title.trim().length === 0 ||
      date.trim().length === 0 ||
      price.trim().length === 0 ||
      description.trim().length === 0
    ) {
      return;
    }
    //const event = { title, price, date, description };
    const requestBody = {
      query: `
        mutation {
          createEvent(eventInput: {title: "${title}", date: "${date}", price: ${price}, description: "${description}"}){
            _id
            title
            price
            date
            description
          }
        }
      `,
    };

    const token = this.context.token;

    fetch("http://localhost:8000/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Login Failed!");
        }
        return res.json();
      })
      .then((resData) => {
        this.setState((prevState) => {
          const updatedEvents = [...prevState.events];
          updatedEvents.push({
            _id: resData.data.createEvent._id,
            title: resData.data.createEvent.title,
            price: resData.data.createEvent.price,
            date: resData.data.createEvent.date,
            description: resData.data.createEvent.description,
            creator: {
              _id: this.context.userId,
            },
          });
          return { events: updatedEvents };
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  fetchEvents() {
    this.setState({ isLoading: true });
    const requestBody = {
      query: `
        query {
          events {
            _id
            title
            price
            date
            description
            creator {
              _id
              email
            }
          }
        }
      `,
    };

    fetch("http://localhost:8000/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Login Failed!");
        }
        return res.json();
      })
      .then((resData) => {
        const newEvents = resData.data.events;
        this.setState({ events: newEvents, isLoading: false });
      })
      .catch((err) => {
        this.setState({ isLoading: false });
        throw err;
      });
  }
  //this function will take in an eventId to set the event object in the State above {selectedEvent}
  //it uses a function form to retrieve the Event from a the prevState.Events with eventId passed in.
  showDetailHandler = (eventId) => {
    this.setState((prevState) => {
      const selectedEvent = prevState.events.find((e) => e._id === eventId);
      return { selectedEvent: selectedEvent };
    });
  };

  render() {
    return (
      <Fragment>
        {(this.state.isCreating || this.state.selectedEvent) && <Backdrop />}
        {this.context.token && (
          <div className="events-control">
            <p>Share your own event</p>
            <button className="btn" onClick={this.createEventHandler}>
              Create Event
            </button>
          </div>
        )}

        {this.state.isLoading ? (
          <Spinner />
        ) : (
          <EventList
            events={this.state.events}
            authUserId={this.context.userId}
            onViewDetail={this.showDetailHandler}
          />
        )}
        {this.state.isCreating && (
          <Modal
            title="Add Event"
            canCancel
            canConfirm
            onCancel={this.onCancelModal}
            onConfirm={this.onConfirmModal}
            confirmText="Confirm"
          >
            <form className="form-control">
              <div className="form-control">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" ref={this.titleRef} />
              </div>
              <div className="form-control">
                <label htmlFor="price">Price</label>
                <input type="number" id="price" ref={this.priceRef} />
              </div>
              <div className="form-control">
                <label htmlFor="date">Date</label>
                <input type="datetime-local" id="date" ref={this.dateRef} />
              </div>
              <div className="form-control">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  rows="3"
                  ref={this.descriptionRef}
                ></textarea>
              </div>
            </form>
          </Modal>
        )}
        {this.state.selectedEvent && (
          <Modal
            title={this.state.selectedEvent.title}
            canCancel
            canConfirm
            onCancel={this.onCancelModal}
            onConfirm={this.bookEventHandler}
            confirmText={this.context.token ? "Book" : "Confirm"}
          >
            <h2>{this.state.selectedEvent.title}</h2>
            <h2>
              ${this.state.selectedEvent.price} --{" "}
              {new Date(this.state.selectedEvent.date).toLocaleDateString()}
            </h2>
            <p>{this.state.selectedEvent.description}</p>
          </Modal>
        )}
      </Fragment>
    );
  }
}
export default EventPage;
