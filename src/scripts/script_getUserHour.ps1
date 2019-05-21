Try  {
  if (-not (Get-Module ActiveDirectory)){
    Import-Module ActiveDirectory
  }
  ## Recebemos o nome do usuário do PHP
  $name = $Args[0]

  ## Capturamos as horas desse usuário
  $LogonHrs = (Get-ADUser -Identity $name -Properties logonHours).logonHours

  ## Retornamos a string para o PHP
  return ''+ $LogonHrs
}
Catch  {
  #Something went wrong
  Return "Oops: Alguma coisa deu errado.<br />$($_.Exception.Message)<br />"
}
