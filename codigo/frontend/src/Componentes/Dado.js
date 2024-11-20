// FUncion para mostrar el dado

function Dado({ numero }) {
  return (
    <div>
      <img 
      src= {numero !== 0 ? `/images/${numero}.png` : '/images/0.png'}
      alt={"Dado " + numero} />
    </div>
  );
}

export default Dado;