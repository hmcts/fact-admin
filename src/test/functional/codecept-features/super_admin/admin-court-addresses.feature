@fact-admin-tab-addresses
Feature: Court-addresses

  Background:
    When I log in as a super-admin
    When I click edit next to court with "barnsley-law-courts"
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over nav element
    Then I click the Addresses tab

  Scenario Outline: Adding incomplete addresses (leaving primary address, secondary town and secondary postcode blank)
    Given I will make sure to clear all entries of the primary address
    When I will make sure to clear all entries for secondary addresses
    When I select the Address Type "5880"
    Then I enter "<town>" in the Town textbox
    Then I select the primary County "50"
    Then I enter "<postcode>" in the postcode textbox
    Then I select the secondary address "1" type as "5881"
    Then I enter "<secondary address>" in the secondary address "1" Address textbox
    Then I select "50" as the secondary address "1" County
    And I click the Save Addresses button
    Then The error message display is "Primary Address: Address is required." "Secondary Address 1: Town is required." "Secondary Address 1: Postcode is required."

    Examples:
      | town     |  postcode | secondary address             |
      | Aberdare |  CF44 0JE | The Court House, Cwmbach Road |

  Scenario: Adding two identical addresses with one containing special characters
    Given I will make sure to remove entries for secondary address "1"
    Given I will make sure to remove entries for secondary address "2"
    And I click the Save Addresses button
    Then A green message is displayed for the updated address "Addresses updated"
    Then I select the secondary address "1" type as "5881"
    Then I enter "test address!, test house" in the secondary address "1" Address textbox
    Then I enter "test town" in the secondary address "1" Town textbox
    Then I select "50" as the secondary address "1" County
    Then I enter "CF44 0JE" in the secondary address "1" Postcode textbox
    Then I select the secondary address "2" type as "5881"
    Then I enter "test address!, test house" in the secondary address "2" Address textbox
    Then I enter "test town" in the secondary address "2" Town textbox
    Then I select "50" as the secondary address "2" County
    Then I enter "CF44 0JE" in the secondary address "2" Postcode textbox
    And I click the Save Addresses button
    Then The error message display is "All addresses must be unique."

  Scenario: Adding two identical addresses with one containing abbreviations
    Given I will make sure to remove entries for secondary address "1"
    Given I will make sure to remove entries for secondary address "2"
    And I click the Save Addresses button
    Then A green message is displayed for the updated address "Addresses updated"
    Then I select the secondary address "1" type as "5881"
    Then I enter "test street" in the secondary address "1" Address textbox
    Then I enter "test town" in the secondary address "1" Town textbox
    Then I select "50" as the secondary address "1" County
    Then I enter "CF44 0JE" in the secondary address "1" Postcode textbox
    Then I select the secondary address "2" type as "5881"
    Then I enter "test st" in the secondary address "2" Address textbox
    Then I enter "test town" in the secondary address "2" Town textbox
    Then I select "50" as the secondary address "2" County
    Then I enter "CF44 0JE" in the secondary address "2" Postcode textbox
    And I click the Save Addresses button
    Then The error message display is "All addresses must be unique."







