

import PropTypes from "prop-types";


const AppointmentCard = ({ items, cancelAppointment, appointmentRazorpay }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 p-4 border-b border-gray-200">
      <div className="flex-shrink-0">
        <img
          className="w-28 h-36 rounded-md object-cover border hover:shadow-2xl hover:shadow-blue-500"
          src={items.docData.image}
          alt="Doctor"
          loading="lazy" 
          
        />
      </div>

      <div className="flex-grow">
        <p className="text-base font-medium text-gray-900">{items.docData.name}</p>
        <p className="text-sm text-gray-600">{items.docData.speciality}</p>
        <p className="text-sm text-gray-500 mt-1">
          Address: {items.docData.address.line1}, {items.docData.address.line2}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          <span className="font-semibold text-gray-700">Date & Time:</span>
          {items.slotDate} | {items.slotTime}
        </p>
      </div>

      <div className="flex flex-col sm:items-end gap-2 mt-4 sm:mt-0">
        {!items.cancelled && items.payment && !items.isCompleted && (
          <button className="ml-2 pr-12 px-4 py-2 shadow-sm shadow-white bg-green-500 text-black rounded font-medium text-sm hover:bg-green-600 hover:text-white transition">
            <p className="pl-5">Paid</p>
          </button>
        )}

        {!items.cancelled && !items.payment && !items.isCompleted && (
          <button
            onClick={() => appointmentRazorpay(items._id)}
            className="px-10 py-2 shadow-sm shadow-blue-500 bg-white text-black rounded font-medium text-sm hover:bg-blue-600 hover:text-white transition"
          >
            <div className="flex gap-1">
              <div>Pay</div>
              <div>Online</div>
            </div>
          </button>
        )}

        {!items.cancelled && !items.isCompleted && (
          <button
            onClick={() => cancelAppointment(items._id)}
            className="pr-6 pl-6 py-2 shadow-sm shadow-red-500 bg-white text-black rounded font-medium text-sm hover:bg-red-600 hover:text-white transition"
          >
            Cancel
          </button>
        )}

        {items.cancelled && !items.isCompleted && (
          <button
            className="pl-6 pr-6 py-2 shadow-sm shadow-red-500 bg-white text-black rounded font-medium text-sm hover:bg-red-600 hover:text-white transition"
          >
            Appointment Cancelled
          </button>
        )}

        {items.isCompleted && (
          <button className="pl-6 pr-6 py-2 shadow-sm shadow-green-500 bg-white text-black rounded font-medium text-sm hover:bg-green-600 hover:text-white transition">
            Completed
          </button>
        )}
      </div>
    </div>
  );
};

AppointmentCard.propTypes = {
  items: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    cancelled: PropTypes.bool,
    payment: PropTypes.bool,
    isCompleted: PropTypes.bool,
    slotDate: PropTypes.string,
    slotTime: PropTypes.string,
    docData: PropTypes.shape({
      name: PropTypes.string,
      speciality: PropTypes.string,
      address: PropTypes.shape({
        line1: PropTypes.string,
        line2: PropTypes.string,
      }),
      image: PropTypes.string,
    }),
  }).isRequired,
  cancelAppointment: PropTypes.func.isRequired,
  appointmentRazorpay: PropTypes.func.isRequired,
};

export default AppointmentCard;
