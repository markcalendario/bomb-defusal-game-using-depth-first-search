"use client";

import styles from "./Buttons.module.scss";

export default function Button(props) {
  const { className, children, onClick } = props;

  return (
    <button
      className={styles.button + (className ? ` ${className}` : "")}
      onClick={onClick}>
      {children}
    </button>
  );
}
