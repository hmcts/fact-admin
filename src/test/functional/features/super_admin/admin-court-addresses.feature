@fact-admin-tab-addresses
Feature: Court-addresses

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    Then I am logged out if I am an admin user
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I click edit next to court with "barnsley-law-courts"
    Then I am redirected to the Edit Court page for the "Barnsley Law Courts"
    And I hover over types nav element
    Then I click the Addresses tab


  Scenario Outline: Adding incomplete addresses (w/o primary address, secondary town/postcode blank and epim invalid)
    Given I will make sure to clear all entries of the primary address
    When I will make sure to clear all entries for secondary address
    When I select the Address Type "5880"
    Then I enter "<town>" in the Town textbox
    Then I select the primary County "50"
    Then I enter "<postcode>" in the postcode textbox
    Then I enter value "<badepim>" in the "primaryAddressEpimId" textbox
    Then I select the secondary address type as "5881"
    Then I enter the secondary court address "<secondary address>" in the Address textbox
    Then I select the secondary County "50"
    And I click the Save Addresses button
    Then The error message display is "Primary Address: Address is required." "Primary Address: ePIMS Ref ID is invalid" "Secondary Address 1: Town is required." "Secondary Address 1: Postcode is required."

    Examples:
      | town     |  postcode | badepim      | secondary address             |
      | Aberdare |  CF44 0JE | bad-epim!!   | The Court House, Cwmbach Road |

  Scenario: Adding two identical addresses with one containing special characters
    Given I will make sure to remove entries for first secondary address
    Given I will make sure to clear all entries of third address
    And I click the Save Addresses button
    Then A green message is displayed for the updated address "Addresses updated"
    Then I select the secondary address type as "5881"
    Then I enter the secondary court address "test address!, test house" in the Address textbox
    Then I enter the secondary address town "test town"
    Then I select the secondary County "50"
    Then I enter the secondary address postcode "CF44 0JE"
    When I select the third address type "5881"
    Then I enter third address address "test address, test house" in the Address textbox
    Then I enter third address "town" in the Town textbox
    Then I select the third County "50"
    Then I enter third address "CF44 0JE" in the postcode textbox
    And I click the Save Addresses button
    Then The error message display is "All addresses must be unique."

  Scenario: Adding two identical addresses with one containing abbreviations
    Given I will make sure to remove entries for first secondary address
    Given I will make sure to clear all entries of third address
    And I click the Save Addresses button
    Then A green message is displayed for the updated address "Addresses updated"
    Then I select the secondary address type as "5881"
    Then I enter the secondary court address "test street" in the Address textbox
    Then I enter the secondary address town "test town"
    Then I select the secondary County "50"
    Then I enter the secondary address postcode "CF44 0JE"
    When I select the third address type "5881"
    Then I enter third address address "test st" in the Address textbox
    Then I enter third address "town" in the Town textbox
    Then I select the third County "50"
    Then I enter third address "CF44 0JE" in the postcode textbox
    And I click the Save Addresses button
    Then The error message display is "All addresses must be unique."
