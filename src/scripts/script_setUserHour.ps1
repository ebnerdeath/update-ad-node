Try  {
  if (-not (Get-Module ActiveDirectory)){
    Import-Module ActiveDirectory
  }

  $secpasswd = ConvertTo-SecureString "SENHA DO ADMINISTRADOR" -AsPlainText -Force
  $mycreds = New-Object System.Management.Automation.PSCredential ("USUÁRIO ADMINISTRADOR DO DOMÍNIO", $secpasswd)

  ## allow logon 8am - 6pm Monday to Friday

  ## Recebemos a string do PHP
  [string]$myArray = $Args[1]
  ## [string]$myArray = '0 0 0 0 248 31 0 248 31 0 248 31 0 248 31 0 248 31 0 0 15'

  ## Quebramos o array pela virgula jogando para um novo array
  [array]$b = $myArray.split(" ")
  ## Jogamos esse array de String para um array de Inteiros fazendo o Parse dos valores
  [array]$c = foreach($number in $b) {([int]::parse($number))}
  ## Jogamos esse array de inteiros para uyum array de Bytes
  [byte[]]$hours = @($c)

  ## Recebemos o nome do usuário do PHP
  $name = $Args[0]
  ## Setamos as horas do usuário de acordo com o que vem do PHP
  set-aduser -identity $name -replace @{logonhours = $hours} -Credential $mycreds

  return "Funcionou"
}
Catch  {
  #Something went wrong
  Return "Oops: Algo deu errado.<br />$($_.Exception.Message)<br />"
}
