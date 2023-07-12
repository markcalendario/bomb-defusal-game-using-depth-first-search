import styles from "./ToolButton.module.scss";

export default function ToolButton({ imageLink, toolName, onClick }) {
  return (
    <button data-aos="flip-left" className={styles.toolButton} onClick={onClick}>
      <img src={imageLink} alt={toolName} />
      <p>{toolName}</p>
    </button>
  );
}
