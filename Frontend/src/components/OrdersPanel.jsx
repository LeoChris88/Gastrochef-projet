export default function OrdersPanel({
  orders,
  serveOrder,
  satisfaction,
}) {
  return (
    <>
      <h3>⭐ Satisfaction : {satisfaction}</h3>

      <div className="orders">
        {orders.map((order) => (
          <div key={order.orderId} className="order-card">
            <strong>{order.recipe.name}</strong>

            <div className="timer-bar">
              <div
                className="timer-progress"
                style={{
                  width: `${order.progress || 100}%`,
                  backgroundColor:
                    order.progress > 60
                      ? "green"
                      : order.progress > 30
                      ? "orange"
                      : "red",
                }}
              />
            </div>

            <button
              onClick={() => serveOrder(order.orderId)}
            >
              Servir
            </button>
          </div>
        ))}
      </div>
    </>
  );
}