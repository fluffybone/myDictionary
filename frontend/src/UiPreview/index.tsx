const theme = {
  primary: "#E59500",
  textMain: "#2B2D42",
};

export const BetterGlassUI = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        // Сделаем фон чуть темнее, чтобы белый блик стекла был виден
        backgroundColor: "#EAEAE8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "sans-serif",
      }}
    >
      {/* 
         --- ЯРКИЕ ПЯТНА (Background Blobs) --- 
         Мы делаем их насыщенными (без прозрачности opacity), 
         потому что стекло само их "приглушит" и размоет.
      */}

      {/* 1. Оранжевое пятно (Слева-сверху от центра) */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "20%",
          width: "400px",
          height: "400px",
          backgroundColor: "#538fdee0", // Чистый яркий цвет
          borderRadius: "50%",
          filter: "blur(100px)", // Сильное размытие краев
          zIndex: 0,
          // Анимация "дыхания" (опционально, можно убрать)
          transform: "translate(-50%, -50%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: "12%",
          right: "25%",
          width: "350px",
          height: "350px",
          //   backgroundColor: "#CE6A85", // Чистый яркий цвет
          backgroundColor: "#dd6484c8", // Чистый яркий цвет
          borderRadius: "50%",
          filter: "blur(90px)",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "60%",
          left: "60%",
          width: "200px",
          height: "200px",
          backgroundColor: "#2B2D42",
          borderRadius: "50%",
          filter: "blur(80px)",
          opacity: 0.6,
          zIndex: 0,
        }}
      />

      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.2)",

          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(16px)", // Safari fix

          // Границы. Сверху белая яркая, снизу почти прозрачная
          borderTop: "1px solid rgba(255, 255, 255, 0.8)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.8)",
          borderRight: "1px solid rgba(255, 255, 255, 0.4)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.4)",

          borderRadius: "30px",
          padding: "50px",
          width: "100%",
          maxWidth: "480px",

          // Тень нужна более четкая, чтобы отделить стекло от фона
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",

          zIndex: 10, // Важно! Карточка поверх пятен
          color: theme.textMain,
        }}
      >
        <h2 style={{ marginTop: 0 }}>Glass Effect</h2>
        <p>Now you should see the blobs through this card.</p>

        <button
          style={{
            width: "100%",
            padding: "15px",
            background: theme.primary,
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 5px 15px rgba(229, 149, 0, 0.4)",
          }}
        >
          Action
        </button>
      </div>
    </div>
  );
};
