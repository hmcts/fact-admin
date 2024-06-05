@fact-admin-tab-local-authorities
Feature: Local authorities

  Background:
    Given a court is created through the API
    When I log in as a super-admin
    When I click edit next to the test court
    Then I am redirected to the Edit Court page for the chosen court
    And I hover over nav element
    And I click the types tab
    And I will make sure Family court type is selected
    And I click on save court type
    And I hover over nav element

  Scenario Outline: Local authorities updated successfully @special

    And I click the cases heard tab
    And I will make sure Adoption is selected
    And I click on update on cases heard
    And I hover over nav element
    And I click the local authorities tab
    And I select area of law "<area_of_law>"
    And I select "<local_authority_name>"
    And I click on local authorities save button
    Then Success message is displayed for local authorities with summary "Local authorities updated"
#    And I deselect "<local_authority_name>"
#    And I click on local authorities save button
#    Then Success message is displayed for local authorities with summary "Local authorities updated"
    Then all the local authorities are removed for area of law "<area_of_law>" through the API
    And the court is cleaned up through the API

    Examples:
      | area_of_law | local_authority_name                 |
      | Adoption    | Barking and Dagenham Borough Council |

  Scenario: When there are no area of law selected for the chosen court user should get proper error message when he clicks on local authorities
    And I click the local authorities tab
    Then An error is displayed for local authorities with title "There is a problem" and summery "You need to enable relevant family court areas of law"
    And the court is cleaned up through the API

  Scenario: When Family court type is not selected for the chosen court local authorities tab should be disabled for the user
    And I click the types tab
    And I will make sure Family court type is not selected
    And I click on save court type
    And I hover over nav element
    Then The local authorities tab should be disabled
    And the court is cleaned up through the API
