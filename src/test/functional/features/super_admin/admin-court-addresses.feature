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
#
#  Scenario Outline: Adding primary address of type: Visit us & secondary address of type: write to us
#    Given I will make sure to clear all entries of the primary address
#    When I select the Address Type "5880"
#    Then I enter court "<address>" in the Address textbox
#    Then I enter "<welsh address>" in the Address Welsh textbox
#    Then I enter "<town>" in the Town textbox
#    Then I enter "<welsh town>" in the town Welsh textbox
#    Then I select the primary County "50"
#    Then I enter "<postcode>" in the postcode textbox
#    When I will make sure to clear all entries for secondary address
#    Then I select the secondary address type as "5881"
#    Then I enter the secondary court address "<secondary address>" in the Address textbox
#    Then I enter the secondary address town "<secondary town>"
#    Then I select the secondary County "50"
#    Then I enter the secondary address postcode "<secondary postcode>"
#    And I click the Save Addresses button
#    Then A green message is displayed for the updated address "Addresses updated"
#
#    Examples:
#      | address                       | welsh address   | town     | welsh town   | postcode | secondary address               | secondary town | secondary postcode |
#      | The Court House, Cwmbach Road | stdtduguguhguhu | Aberdare | fctgfjyfyjgv | CF44 0JE | The Court House, 1 Cwmbach Road | Aberdare       | CF44 0JE           |
#
#  Scenario Outline: Adding secondary address and primary address both of type: Visit us
#    Given I will make sure to clear all entries of the primary address
#    When I select the Address Type "5880"
#    Then I enter court "<address>" in the Address textbox
#    Then I enter "<welsh address>" in the Address Welsh textbox
#    Then I enter "<town>" in the Town textbox
#    Then I enter "<welsh town>" in the town Welsh textbox
#    Then I select the primary County "50"
#    Then I enter "<postcode>" in the postcode textbox
#    When I will make sure to clear all entries for secondary address
#    Then I select the secondary address type as "5880"
#    Then I enter the secondary court address "<secondary address>" in the Address textbox
#    Then I enter the secondary address town "<secondary town>"
#    Then I select the secondary County "50"
#    Then I enter the secondary address postcode "<secondary postcode>"
#    And I click the Save Addresses button
#    Then The error message display is "Only one visit address is permitted."
#
#    Examples:
#      | address                       | welsh address   | town     | welsh town   | postcode | secondary address               | secondary town | secondary postcode |
#      | The Court House, Cwmbach Road | stdtduguguhguhu | Aberdare | fctgfjyfyjgv | CF44 0JE | The Court House, 1 Cwmbach Road | Aberdare       | CF44 0JE           |
#
#
#  Scenario: Adding third address of type: write to us
#    Given I will make sure to clear all entries of third address
#    When I select the third address type "5881"
#    Then I enter third address address "third test address" in the Address textbox
#    Then I enter third address welsh address "test welsh address" in the Address Welsh textbox
#    Then I enter third address "town" in the Town textbox
#    Then I enter third address "welsh town" in the town Welsh textbox
#    Then I select the third County "50"
#    Then I enter third address "CF44 0JE" in the postcode textbox
#    And I click the Save Addresses button
#    Then A green message is displayed for the updated address "Addresses updated"

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
#
#  Scenario Outline: Adding primary address with invalid postcode
#    Given I will make sure to clear all entries of the primary address
#    When I select the Address Type "5880"
#    Then I enter court "<address>" in the Address textbox
#    Then I enter "<town>" in the Town textbox
#    Then I select the primary County "50"
#    Then I enter "<postcode>" in the postcode textbox
#    And I click the Save Addresses button
#    Then The error message display is "Primary Address: Postcode is invalid."
#
#    Examples:
#      | address                       |  town     |  postcode |
#      | The Court House, Cwmbach Road |  Aberdare |  CF44 0JE45 |
#
#  Scenario Outline: Adding primary address with postcode doesn't exist
#    Given I will make sure to clear all entries of the primary address
#    When I select the Address Type "5880"
#    Then I enter court "<address>" in the Address textbox
#    Then I enter "<town>" in the Town textbox
#    Then I select the primary County "50"
#    Then I enter "<postcode>" in the postcode textbox
#    And I click the Save Addresses button
#    Then The error message display is "Primary Address: Postcode entered could not be found."
#
#    Examples:
#      | address                       |  town     |  postcode |
#      | The Court House, Cwmbach Road |  Aberdare |  BD9 6GS  |
#
#  Scenario: Adding secondary address 1 for an area of law or court type
#    Given I will make sure to remove entries for first secondary address
#    And I click the Save Addresses button
#    Then A green message is displayed for the updated address "Addresses updated"
#    Then I select the secondary address type as "5881"
#    Then I enter the secondary court address "test address" in the Address textbox
#    Then I select yes for area of law and court type
#    Then I select children and civil from area of law and county court for court type
#    Then I enter the secondary address town "test town"
#    Then I enter the secondary address town welsh "test town welsh"
#    Then I select the secondary County "50"
#    Then I enter the secondary address postcode "bd9 6sg"
#    And I click the Save Addresses button
#    Then A green message is displayed for the updated address "Addresses updated"
#    Then I click the link view court in new tab to validate the label generated
#
#  Scenario: Adding 2 secondary addresses with same area of law or court type
#    Given I will make sure to remove entries for first secondary address
#    Given I will make sure to clear all entries of third address
#    And I click the Save Addresses button
#    Then A green message is displayed for the updated address "Addresses updated"
#    Then I select the secondary address type as "5881"
#    Then I enter the secondary court address "test address" in the Address textbox
#    Then I select yes for area of law and court type
#    Then I select children and civil from area of law and county court for court type
#    Then I enter the secondary address town "test town"
#    Then I select the secondary County "50"
#    Then I enter the secondary address postcode "bd9 6sg"
#    When I select the third address type "5881"
#    Then I enter third address address "test address" in the Address textbox
#    Then I select yes for second secondary court area of law and court type
#    Then I select children and civil for second secondary court area of law and county court for court type
#    Then I enter third address "town" in the Town textbox
#    Then I select the third County "50"
#    Then I enter third address "CF44 0JE" in the postcode textbox
#    And I click the Save Addresses button
#    Then The error message display is "Secondary addresses cannot have duplicate areas of law or court types selected. Conflicting options selected are: \"Children, County Court\""
#
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
