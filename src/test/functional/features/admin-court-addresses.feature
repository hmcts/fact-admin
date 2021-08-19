Feature: Court-addresses

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I select Include closed courts
    Then I can view the courts or tribunals in a list format
    When I click edit next to court with "aberdare-county-court"
    Then I am redirected to the Edit Court page for the chosen court
    And I hover over types nav element
    Then I click the Addresses tab

  Scenario Outline: Adding primary address of type: Visit us & secondary address of type: write to us
    Given I will make sure to clear all entries of the primary address
    When I select the Address Type "5880"
    Then I enter court "<address>" in the Address textbox
    Then I enter "<welsh address>" in the Address Welsh textbox
    Then I enter "<town>" in the Town textbox
    Then I enter "<welsh town>" in the town Welsh textbox
    Then I enter "<postcode>" in the postcode textbox
    When I will make sure to clear all entries for secondary address
    Then I select the secondary address type as "5881"
    Then I enter the secondary court address "<secondary address>" in the Address textbox
    Then I enter the secondary address town "<secondary town>"
    Then I enter the secondary address postcode "<secondary postcode>"
    And I click the Save Addresses button
    Then A green message is displayed for the updated address "Addresses updated"

    Examples:
      | address                       | welsh address   | town     | welsh town   | postcode | secondary address             |secondary town | secondary postcode |
      | The Court House, Cwmbach Road | stdtduguguhguhu | Aberdare | fctgfjyfyjgv | CF44 0JE | The Court House, Cwmbach Road | Aberdare      | CF44 0JE           |

  Scenario Outline: Adding secondary address and primary address both of type: Visit us
    Given I will make sure to clear all entries of the primary address
    When I select the Address Type "5880"
    Then I enter court "<address>" in the Address textbox
    Then I enter "<welsh address>" in the Address Welsh textbox
    Then I enter "<town>" in the Town textbox
    Then I enter "<welsh town>" in the town Welsh textbox
    Then I enter "<postcode>" in the postcode textbox
    When I will make sure to clear all entries for secondary address
    Then I select the secondary address type as "5880"
    Then I enter the secondary court address "<secondary address>" in the Address textbox
    Then I enter the secondary address town "<secondary town>"
    Then I enter the secondary address postcode "<secondary postcode>"
    And I click the Save Addresses button
    Then The error message display is "Only one visit address is permitted."

    Examples:
      | address                       | welsh address   | town     | welsh town   | postcode | secondary address             |secondary town | secondary postcode |
      | The Court House, Cwmbach Road | stdtduguguhguhu | Aberdare | fctgfjyfyjgv | CF44 0JE | The Court House, Cwmbach Road | Aberdare      | CF44 0JE           |


  Scenario Outline: Adding incomplete addresses (leaving primary address, secondary town and secondary postcode blank)
    Given I will make sure to clear all entries of the primary address
    When I will make sure to clear all entries for secondary address
    When I select the Address Type "5880"
    Then I enter "<town>" in the Town textbox
    Then I enter "<postcode>" in the postcode textbox
    Then I select the secondary address type as "5881"
    Then I enter the secondary court address "<secondary address>" in the Address textbox
    And I click the Save Addresses button
    Then The error message display is "Primary Address: Address is required." "Secondary Address: Town is required." "Secondary Address: Postcode is required."

    Examples:
      | town     |  postcode | secondary address             |
      | Aberdare |  CF44 0JE | The Court House, Cwmbach Road |

  Scenario Outline: Adding primary address with invalid postcode
    Given I will make sure to clear all entries of the primary address
    When I select the Address Type "5880"
    Then I enter court "<address>" in the Address textbox
    Then I enter "<town>" in the Town textbox
    Then I enter "<postcode>" in the postcode textbox
    And I click the Save Addresses button
    Then The error message display is "Primary Address: Postcode is invalid."

    Examples:
      | address                       |  town     |  postcode |
      | The Court House, Cwmbach Road |  Aberdare |  CF44 0JE45 |

  Scenario Outline: Adding primary address with postcode doesn't exist
    Given I will make sure to clear all entries of the primary address
    When I select the Address Type "5880"
    Then I enter court "<address>" in the Address textbox
    Then I enter "<town>" in the Town textbox
    Then I enter "<postcode>" in the postcode textbox
    And I click the Save Addresses button
    Then The error message display is "Primary Address: Postcode entered could not be found."

    Examples:
      | address                       |  town     |  postcode |
      | The Court House, Cwmbach Road |  Aberdare |  BD9 6GS  |