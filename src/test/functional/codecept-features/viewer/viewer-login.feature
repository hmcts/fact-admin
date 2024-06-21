@fact-admin-login-logout @special
Feature: Login/Logout

  Background:
    Given a court is created through the API
    When I log in as a viewer
    And I cannot view super admin content
    When I click edit next to the test court
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over nav element

  Scenario Outline: viewer can log in and can see specific tabs for a selected court
    Then the "<tab>" tab is visible
    And the court is cleaned up through the API
    Examples:
      | tab                          |
      | #tab_postcodes               |
      | #tab_local-authorities       |

  Scenario Outline: viewer can log in and cannot see specific tabs for a selected court
    Then the "<tab>" tab is not visible
    And the court is cleaned up through the API
    Examples:
      | tab                          |
      | #tab_opening-hours           |
      | #tab_phone-numbers           |
      | #tab_emails                  |
      | #tab_court-types             |
      | #tab_court-facilities        |
      | #tab_cases-heard             |
      | #tab_addresses               |
      | #tab_photo                   |
      | #tab_application-progression |
      | #tab_additional-links        |
      | #tab_spoe                    |
