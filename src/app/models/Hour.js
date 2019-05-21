module.exports = (sequelize, DataTypes) => {
  const Hour = sequelize.define('Hour', {
    byte: DataTypes.INTEGER,
    hora: DataTypes.INTEGER,
    valor: DataTypes.INTEGER,
    posicao_array: DataTypes.INTEGER,
    dia_semana: DataTypes.INTEGER
  })

  return Hour
}
