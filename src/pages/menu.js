 import React, { useState } from 'react';
import styles from '../style/Menu.module.css'; // Importamos los estilos como un módulo
import imghamburgesa from '../img/hamburgesas.jfif'
import imgcamarones from '../img/CAMRONES.jpg'
import imgceviches from '../img/CEVICHE.jpg'

const Menu = () => {
    const [selectedTable, setSelectedTable] = useState('');
    const [selectedItems, setSelectedItems] = useState({});
    const [totalPrice, setTotalPrice] = useState(0);

    const showMenu = (e) => {
        setSelectedTable(e.target.value);
    };

    const updateItem = (item, quantity, price) => {
        setSelectedItems((prevItems) => {
            const updatedItems = { ...prevItems };
            const newQuantity = (updatedItems[item]?.quantity || 0) + quantity;
            if (newQuantity <= 0) {
                delete updatedItems[item];
            } else {
                updatedItems[item] = { quantity: newQuantity, price };
            }

            return updatedItems;
        });

        setTotalPrice((prevTotal) => prevTotal + quantity * price);
    };

    return (
        <div>
            <header className={styles.header}>
                <h1>Menú de Restaurante</h1>
                <p>¡Selecciona la mesa y tus platillos favoritos!</p>
            </header>

            <div className={styles.mesaSelection}>
                <label htmlFor="mesa">Selecciona tu mesa:</label>
                <select id="mesa" onChange={showMenu}>
                    <option value="" disabled selected>
                        Elige una mesa
                    </option>
                    <option value="1">Mesa 1</option>
                    <option value="2">Mesa 2</option>
                    <option value="3">Mesa 3</option>
                </select>       
            </div>
            {selectedTable && (
                <div className={styles.menuContainer}>
                    <div className={styles.card}>
                        <img src={imghamburgesa} alt="Hamburguesa" />
                        <h3>Hamburguesa con papas fritas y coca-cola</h3>
                        <p>Q.40.00</p>
                        <div className={styles.cardButtons}>
                            <button
                                className={styles.btnDecrease}
                                onClick={() => updateItem('Hamburguesa', -1, 40)}
                            >
                                -
                            </button>
                            <span>{selectedItems['Hamburguesa']?.quantity || 0}</span>
                            <button
                                className={styles.btnIncrease}
                                onClick={() => updateItem('Hamburguesa', 1, 40)}
                            >
                                +
                            </button>
                        </div>
                    </div>
                    <div className={styles.card}>
                        <img src={imgcamarones} alt="Camarones" />
                        <h3>Camarones con Papas Fritas</h3>
                        <p>Q.60.00</p>
                        <div className={styles.cardButtons}>
                            <button
                                className={styles.btnDecrease}
                                onClick={() => updateItem('Camarones', -1, 60)}
                            >
                                -
                            </button>
                            <span>{selectedItems['Camarones']?.quantity || 0}</span>
                            <button
                                className={styles.btnIncrease}
                                onClick={() => updateItem('Camarones', 1, 60)}
                            >
                                +
                            </button>
                        </div>
                    </div>
                    <div className={styles.card}>
                        <img src={imgceviches} alt="Ceviche" />
                        <h3>Ceviche</h3>
                        <p>Q.35.00</p>
                        <div className={styles.cardButtons}>
                            <button
                                className={styles.btnDecrease}
                                onClick={() => updateItem('Ceviche', -1, 35)}
                            >
                                -
                            </button>
                            <span>{selectedItems['Ceviche']?.quantity || 0}</span>
                            <button
                                className={styles.btnIncrease}
                                onClick={() => updateItem('Ceviche', 1, 35)}
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {Object.keys(selectedItems).length > 0 && (
                <div className={styles.selectedItems}>
                    <h3>Productos Seleccionados:</h3>
                    <ul>
                        {Object.entries(selectedItems).map(([item, { quantity, price }]) => (
                            <li key={item}>
                                {item} - {quantity} x Q.{price}
                            </li>
                        ))}
                    </ul>
                    <h4>Total: Q.{totalPrice.toFixed(2)}</h4>
                </div>
            )}
        </div>
    );
};

export default Menu;
