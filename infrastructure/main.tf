provider "azurerm" {
  features {}
}

locals {
  vaultName = "${var.product}-${var.env}"
}

data "azurerm_subnet" "core_infra_redis_subnet" {
  name                 = "core-infra-subnet-1-${var.env}"
  virtual_network_name = "core-infra-vnet-${var.env}"
  resource_group_name = "core-infra-${var.env}"
}

module "fact-admin-session-storage" {
  source   = "git@github.com:hmcts/cnp-module-redis?ref=master"
  product  = "${var.product}-${var.component}-session-storage"
  location = var.location
  env      = var.env
  subnetid = data.azurerm_subnet.core_infra_redis_subnet.id
  common_tags  = var.common_tags
}

data "azurerm_key_vault" "key_vault" {
  name = local.vaultName
  resource_group_name = local.vaultName
}

resource "azurerm_key_vault_secret" "redis_access_key" {
  name         = "redis-access-key"
  value        = module.fact-admin-session-storage.access_key
  key_vault_id = data.azurerm_key_vault.key_vault.id
}

data "azurerm_key_vault_secret" "csrf_token_secret" {
  name          = "csrf-token-secret"
  key_vault_id  = data.azurerm_key_vault.key_vault.id
}

data "azurerm_key_vault_secret" "launchdarkly_sdk_key" {
  name          = "launchdarkly-sdk-key"
  key_vault_id  = data.azurerm_key_vault.key_vault.id
}

data "azurerm_key_vault_secret" "storage-account-name" {
 name          = "storage-account-name"
  key_vault_id  = data.azurerm_key_vault.key_vault.id
}

data "azurerm_key_vault_secret" "storage-account-primary-key" {
 name          = "storage-account-primary-key"
  key_vault_id  = data.azurerm_key_vault.key_vault.id
}
